
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

// --- FIXED: ฟังก์ชันเพิ่มสินค้า ---
export const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });

  // ---- ส่วนที่แก้ไข ----
  if (!response.ok) {
    // ลองอ่าน body ของ response เพื่อดู error message ที่เราส่งมาจาก backend
    // เราจะเช็คสถานะ 409 ที่เราตั้งไว้ใน Backend สำหรับกรณีชื่อซ้ำ
    const errorData = await response.json().catch(() => ({ message: 'Failed to add product' }));
    
    // โยน Error พร้อมข้อความจาก Backend
    throw new Error(errorData.message || 'Failed to add product');
  }
  // ---- จบส่วนที่แก้ไข ----

  return response.json();
};

  const newProductId = (rpcData as any)?.id;
  if (!newProductId) throw new Error('RPC did not return a new product ID.');
  
  return await fetchProduct(newProductId);
}

// --- FIXED: ฟังก์ชันอัปเดตสินค้า ---
export async function updateProduct(product: Product): Promise<Product> {
  const { data: { user } } = await supabase.auth.getUser();
  console.log("CURRENT USER:", user);
  console.log("updateProduct: calling RPC with data:", product);

  // Fix: Convert Product to JSON-compatible format
  const jsonCompatibleData = JSON.parse(JSON.stringify(product));

  const { error } = await supabase.rpc('upsert_product_with_relations', {
      p_data: jsonCompatibleData
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
