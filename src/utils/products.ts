
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types";

// Helper: แปลงข้อมูลจาก DB มาเป็น Type ของ Frontend (เวอร์ชันสมบูรณ์)
async function supabaseProductToProduct(p: any): Promise<Product> {
  let productImages: any[] = [];
  try {
    const { data } = await supabase.from('product_images').select('*').eq('product_id', p.id);
    productImages = data || [];
  } catch (error) {
    console.warn(`Failed to fetch product images for product ${p.id}`, error);
  }

  let fetchedTags: string[] = [];
  try {
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('name, product_tags!inner(product_id)')
      .eq('product_tags.product_id', p.id);
    if (tagsError) throw tagsError;
    if (tagsData) fetchedTags = tagsData.map((t: any) => t.name);
  } catch (error) {
    console.warn(`Failed to fetch tags for product ${p.id}`, error);
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

// ดึงสินค้าทั้งหมด
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
  return Promise.all((data ?? []).map(supabaseProductToProduct));
}

// ดึงสินค้าชิ้นเดียว
export async function fetchProduct(productId: number): Promise<Product> {
  const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
  if (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw new Error('Failed to fetch product');
  }
  return await supabaseProductToProduct(data);
}

// Helper function to convert Product to JSON for database
function productToJson(product: Product | Omit<Product, "id">): any {
  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    categories: product.categories,
    product_type: product.productType,
    image: product.image,
    images: product.images,
    price_yuan: product.priceYuan,
    exchange_rate: product.exchangeRate,
    price_thb: product.priceThb,
    import_cost: product.importCost,
    cost_thb: product.costThb,
    selling_price: product.sellingPrice,
    product_status: product.status,
    shipment_date: product.shipmentDate?.trim() === "" ? null : product.shipmentDate,
    link: product.link,
    description: product.description,
    quantity: product.quantity,
    options: product.options,
    tags: product.tags,
  };
}

// --- FIXED: ฟังก์ชันเพิ่มสินค้า ---
// --- โค้ดใหม่ที่ถูกต้อง ---
export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  // ตัด id ที่เป็น string ออกไป (ถูกต้องแล้ว)
  const { id, ...productDataForInsert } = product as any;
  console.log("addProduct: calling RPC with data:", productDataForInsert);

  // เรียก RPC โดยส่งข้อมูลจากฟอร์มไปตรงๆ "ไม่ต้องแปลภาษา"
  const { data: rpcData, error } = await supabase.rpc('upsert_product_with_relations', {
    p_data: productDataForInsert
  });

  if (error) {
    console.error("RPC Error:", error.message);
    throw new Error('Failed to add product via RPC: ' + error.message);
  }

  const newProductId = (rpcData as any)?.id; // แก้ key ให้ถูกต้องเป็น id
  if (!newProductId) throw new Error('RPC did not return a new product ID.');

  return await fetchProduct(newProductId);
}

// --- FIXED: ฟังก์ชันอัปเดตสินค้า ---
export async function updateProduct(product: Product): Promise<Product> {
  console.log("updateProduct: calling RPC with data:", product);

  // เรียก RPC โดยส่งข้อมูลจากฟอร์มไปตรงๆ "ไม่ต้องแปลภาษา"
  const { error } = await supabase.rpc('upsert_product_with_relations', {
    p_data: product
  });

  if (error) {
    console.error('Error updating product via RPC:', error);
    alert(`Failed to update product: ${error.message}`);
    throw new Error('Failed to update product via RPC');
  }

  return await fetchProduct(product.id!);
}

// --- FIXED: ฟังก์ชันลบสินค้า ---
export async function deleteProduct(productId: number): Promise<void> {
  console.log('Deleting product and relations for ID:', productId);
  try {
    const { error: imagesError } = await supabase.from('product_images').delete().eq('product_id', productId);
    if (imagesError) throw imagesError;
    
    const { error: tagsError } = await supabase.from('product_tags').delete().eq('product_id', productId);
    if (tagsError) throw tagsError;

    const { error: productError } = await supabase.from('products').delete().eq('id', productId);
    if (productError) throw productError;
    
    console.log('Product deleted successfully');
  } catch (error: any) {
    console.error('Delete product error:', error);
    throw new Error('Failed to delete product: ' + error.message);
  }
}
