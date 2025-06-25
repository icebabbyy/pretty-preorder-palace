console.log("✅✅✅ FILE products.ts LOADED! ✅✅✅");

import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductImage } from "@/types";
import { fetchProductImages, addProductImage, deleteProductImage } from "./productImages";

// Helper: แปลงข้อมูลจาก DB มาเป็น Type ของ Frontend
async function supabaseProductToProduct(p: any): Promise<Product> {
  // Fetch product images
  let productImages: ProductImage[] = [];
  try {
    productImages = await fetchProductImages(p.id);
  } catch (error) {
    console.warn('Failed to fetch product images for product', p.id, error);
  }

  // Fetch tags
  let fetchedTags: string[] = [];
  try {
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('name, product_tags!inner(product_id)')
      .eq('product_tags.product_id', p.id);
    if (tagsError) throw tagsError;
    if (tagsData) {
      fetchedTags = tagsData.map((t: any) => t.name);
    }
  } catch (error) {
    console.warn('Failed to fetch tags for product', p.id, error);
  }

  const mainImage = productImages.length > 0 ? productImages[0].image_url : (p.image || "");

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category || "",
    categories: p.category ? [p.category] : [],
    productType: p.product_type || "",
    image: mainImage,
    images: productImages,
    priceYuan: p.price_yuan ?? 0,
    exchangeRate: p.exchange_rate ?? 5,
    priceThb: (p.price_yuan ?? 0) * (p.exchange_rate ?? 1),
    importCost: p.import_cost ?? 0,
    costThb: p.cost_thb ?? 0,
    sellingPrice: p.selling_price ?? 0,
    status: p.product_status || "",
    shipmentDate: p.shipment_date ? p.shipment_date.toString() : "",
    link: p.link || "",
    description: p.description || "",
    quantity: p.quantity ?? 0,
    options: p.options ?? [],
    tags: fetchedTags,
  };
}

// (ฟังก์ชัน syncProductOptionImages ไม่ต้องแก้ไข)
async function syncProductOptionImages(productId: number, options: any[]) {
    if (!options || options.length === 0) return;
    try {
      for (const option of options) {
        if (option.image && option.image !== '') {
          const { data: existingImages } = await supabase
            .from('product_images')
            .select('id, image_url')
            .eq('product_id', productId)
            .eq('variant_id', option.id);
  
          if (!existingImages || existingImages.length === 0) {
            await addProductImage(productId, option.image, undefined, option.id, option.name);
          } else {
            const existingImage = existingImages[0];
            if (existingImage.image_url !== option.image) {
              await supabase.from('product_images').update({ image_url: option.image, variant_name: option.name }).eq('id', existingImage.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error syncing product option images:', error);
    }
}

// ดึงสินค้าทั้งหมด
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
  return Promise.all((data ?? []).map(supabaseProductToProduct));
}

// ดึงสินค้าชิ้นเดียว
export async function fetchProduct(productId: number): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw new Error('Failed to fetch product');
  }
  return await supabaseProductToProduct(data);
}

// เพิ่มสินค้าใหม่ (ใช้ RPC)
export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  console.log("addProduct: calling RPC with data:", product);

  const { data: rpcData, error } = await supabase.rpc('upsert_product_with_relations', {
    p_data: product
  });

  if (error) {
    console.error('Error adding product via RPC:', error);
    alert('Failed to add product: ' + (error.message || ''));
    throw new Error('Failed to add product');
  }

  const newProductId = (rpcData as any)?.id;
  if (!newProductId) {
    throw new Error('RPC did not return a new product ID.');
  }
  
  await syncProductOptionImages(newProductId, product.options || []);
  return await fetchProduct(newProductId);
}

// อัปเดตสินค้า (ใช้ RPC)
export async function updateProduct(product: Product): Promise<Product> {
    console.log("🔴🔴🔴 FUNCTION updateProduct CALLED! 🔴🔴🔴");
  console.log("updateProduct: calling RPC with data:", product);
 // --- V V V เพิ่มบรรทัดนี้เข้าไปเลยครับ V V V ---
  console.log("DEBUG PAYLOAD TO RPC:", JSON.stringify(product, null, 2));
  // --- ^ ^ ^ สิ้นสุดบรรทัดที่ให้เพิ่ม ^ ^ ^ ---

  console.log("updateProduct: calling RPC with data:", product);
  const { error } = await supabase.rpc('upsert_product_with_relations', {
      p_data: product
  });

  if (error) {
      console.error('Error updating product via RPC:', error);
      alert(`Failed to update product: ${error.message}`);
      throw new Error('Failed to update product via RPC');
  }
  
  await syncProductOptionImages(product.id!, product.options || []);
  return await fetchProduct(product.id!);
}

// ลบสินค้า (แก้ไขให้สมบูรณ์)
export async function deleteProduct(productId: number): Promise<void> {
  console.log('Deleting product and relations for ID:', productId);
  
  try {
    // 1. ลบจาก product_images
    const { error: imagesError } = await supabase.from('product_images').delete().eq('product_id', productId);
    if (imagesError) throw imagesError;
    
    // 2. ลบจาก product_tags
    const { error: tagsError } = await supabase.from('product_tags').delete().eq('product_id', productId);
    if (tagsError) throw tagsError;

    // 3. ลบจาก products
    const { error: productError } = await supabase.from('products').delete().eq('id', productId);
    if (productError) throw productError;
    
    console.log('Product deleted successfully');
  } catch (error: any) {
    console.error('Delete product error:', error);
    throw new Error('Failed to delete product: ' + error.message);
  }
}
