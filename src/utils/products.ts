// src/utils/products.ts

import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductImage, ProductOption } from "@/types";
import { fetchProductImages, addProductImage } from "./productImages";

// Helper: แปลงข้อมูลจาก Supabase (snake_case) มาเป็นข้อมูลที่ Frontend ใช้ (camelCase)
async function supabaseProductToProduct(p: any): Promise<Product> {
  let productImages: ProductImage[] = [];
  try {
    productImages = await fetchProductImages(p.id);
  } catch (error) {
    console.warn('Failed to fetch product images for product', p.id, error);
  }

  const mainImage = productImages.length > 0 ? productImages[0].image_url : (p.image || "");

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category || "",
    categories: p.categories ?? (p.category ? [p.category] : []),
    productType: p.product_type || "",
    image: mainImage,
    images: productImages,
    priceYuan: p.price_yuan ?? 0,
    exchangeRate: p.exchange_rate ?? 5,
    priceThb: p.price_thb ?? 0,
    importCost: p.import_cost ?? 0,
    costThb: p.cost_thb ?? 0,
    sellingPrice: p.selling_price ?? 0,
    status: p.product_status || "",
    shipmentDate: p.shipment_date ? p.shipment_date.toString() : "",
    link: p.link || "",
    description: p.description || "",
    quantity: p.quantity ?? 0,
    options: p.options ?? [],
    tags: p.tags ?? [], // <--- แก้ไขจุดที่ 1
  };
}

// Helper: แปลงข้อมูลจาก Frontend (camelCase) ไปเป็นข้อมูลที่ Supabase เข้าใจ (snake_case)
function productToSupabaseInsert(product: Partial<Product>) {
  const quantity = typeof product.quantity === "number" && !isNaN(product.quantity) ? product.quantity : 0;
  const category = product.categories && product.categories.length > 0 ? product.categories[0] : product.category || "";

  return {
    sku: product.sku,
    name: product.name,
    category: category,
    categories: product.categories,
    product_type: product.productType || null,
    image: product.image,
    price_yuan: product.priceYuan,
    exchange_rate: product.exchangeRate,
    import_cost: product.importCost,
    cost_thb: product.costThb,
    selling_price: product.sellingPrice,
    product_status: product.status,
    shipment_date: product.shipmentDate && product.shipmentDate !== "" ? product.shipmentDate : null,
    link: product.link,
    description: product.description,
    quantity: quantity,
    options: product.options ? (product.options as any) : undefined,
    tags: product.tags, // <--- แก้ไขจุดที่ 2
  };
}

// (ฟังก์ชัน syncProductOptionImages ถ้ามี ก็คงไว้เหมือนเดิม)

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false, nullsFirst: false });
  if (error) throw new Error('Failed to fetch products');
  const products = await Promise.all((data ?? []).map(supabaseProductToProduct));
  return products;
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const obj = productToSupabaseInsert(product);
  const { data, error } = await supabase.from('products').insert([obj as any]).select().single();
  if (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
  return await supabaseProductToProduct(data);
}

export async function updateProduct(product: Product): Promise<Product> {
  const obj = productToSupabaseInsert(product);
  const { data, error } = await supabase.from('products').update({ ...obj, updated_at: new Date().toISOString() } as any).eq('id', product.id).select().single();
  if (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
  return await supabaseProductToProduct(data);
}

export async function deleteProduct(productId: number): Promise<void> {
  const { error: imagesError } = await supabase.from('product_images').delete().eq('product_id', productId);
  if (imagesError) throw new Error('Failed to delete product images: ' + imagesError.message);
  
  const { error: productError } = await supabase.from('products').delete().eq('id', productId);
  if (productError) throw new Error('Failed to delete product: ' + productError.message);
}
