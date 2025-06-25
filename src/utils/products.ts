import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductImage } from "@/types";
import { fetchProductImages, addProductImage, deleteProductImage } from "./productImages";

// -- CHANGED --: แก้ไขการดึงข้อมูล Tags ให้ถูกต้อง
async function supabaseProductToProduct(p: any): Promise<Product> {
  // Fetch product images (เหมือนเดิม)
  let productImages: ProductImage[] = [];
  try {
    productImages = await fetchProductImages(p.id);
  } catch (error) {
    console.warn('Failed to fetch product images for product', p.id, error);
  }

  // -- ADDED --: ดึงข้อมูล Tags จากความสัมพันธ์ Many-to-Many
  let fetchedTags: string[] = [];
  try {
    // ใช้ !inner join เพื่อดึงชื่อ 'name' จากตาราง 'tags'
    // โดยเชื่อมผ่านตาราง 'product_tags' ที่มี 'product_id' ตรงกัน
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
    categories: p.categories ?? (p.category ? [p.category] : []), // -- FIXED --
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
    tags: fetchedTags, // -- CHANGED --: ใช้ Tags ที่ดึงมาใหม่
  };
}

// ฟังก์ชันนี้ไม่ได้ใช้แล้วเมื่อเรียกผ่าน RPC แต่เก็บไว้เผื่อส่วนอื่นเรียกใช้
function productToSupabaseInsert(product: Omit<Product, "id"> | Product) {
  // ... (โค้ดเดิม ไม่ต้องแก้ไข)
}

// ... (ฟังก์ชัน syncProductOptionImages ไม่ต้องแก้ไข)

// --- fetchProducts ไม่ต้องแก้ไข แต่จะทำงานถูกต้องเองเพราะ supabaseProductToProduct ถูกแก้แล้ว ---
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }

  const products = await Promise.all(
    (data ?? []).map(supabaseProductToProduct)
  );

  return products;
}

// --- ADDED ---: ฟังก์ชันสำหรับดึงข้อมูลสินค้าชิ้นเดียว (จำเป็นหลัง add/update)
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

// -- CHANGED --: เปลี่ยนไปใช้ RPC
export async function addProduct(product: Omit<Product, "id"> & { images?: ProductImage[] }): Promise<Product> {
  console.log("addProduct: data to upsert via RPC:", product);

  // เรียกใช้ฟังก์ชัน RPC ที่เราสร้างไว้ในฐานข้อมูล
  const { data: rpcData, error } = await supabase.rpc('upsert_product_with_relations', {
    p_data: product
  });

  if (error) {
    console.error('Error adding product via RPC:', error);
    alert('Failed to add product: ' + (error.message || ''));
    throw new Error('Failed to add product');
  }

  // rpcData จะคืนค่ามาเป็น { id: new_product_id }
  const newProductId = (rpcData as any)?.id;
  if (!newProductId) {
    throw new Error('RPC did not return a new product ID.');
  }
  
  // ดึงข้อมูลสินค้าที่สร้างเสร็จสมบูรณ์กลับมาอีกครั้ง เพื่อให้ได้ข้อมูลล่าสุด
  return await fetchProduct(newProductId);
}

// -- CHANGED --: เปลี่ยนไปใช้ RPC
export async function updateProduct(product: Product & { images?: ProductImage[] }): Promise<Product> {
  console.log("updateProduct: data to upsert via RPC:", product, "ID:", product.id);
  
  // เรียกใช้ฟังก์ชัน RPC เดียวกัน (มันคือ Upsert)
  const { error } = await supabase.rpc('upsert_product_with_relations', {
    p_data: product
  });

  if (error) {
    console.error('Error updating product via RPC:', error);
    alert('Failed to update product: ' + (error.message || ''));
    throw new Error('Failed to update product');
  }

  // ดึงข้อมูลสินค้าที่อัปเดตแล้วกลับมาอีกครั้ง
  return await fetchProduct(product.id!);
}

// -- CHANGED --: เพิ่มการลบข้อมูลจาก product_tags
export async function deleteProduct(productId: number): Promise<void> {
  console.log('Deleting product ID:', productId);
  
  try {
    // 1. ลบจาก product_images (เหมือนเดิม)
    const { error: imagesError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);
    if (imagesError) throw imagesError;
    
    // 2. -- ADDED -- ลบจาก product_tags
    const { error: tagsError } = await supabase
      .from('product_tags')
      .delete()
      .eq('product_id', productId);
    if (tagsError) throw tagsError;

    // 3. ลบจาก products (เหมือนเดิม)
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (productError) throw productError;
    
    console.log('Product and its relations deleted successfully');
  } catch (error: any) {
    console.error('Delete product error:', error);
    throw new Error('Failed to delete product: ' + error.message);
  }
}
