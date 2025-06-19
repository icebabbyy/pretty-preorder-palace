
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types";

// Helper: snake_case to camelCase
function supabaseProductToProduct(p: any): Product {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category || "",
    categories: p.category ? [p.category] : [], // Create categories array from single category
    productType: p.product_type || "",
    image: p.image || "",
    priceYuan: p.price_yuan ?? 0,
    exchangeRate: p.exchange_rate ?? 5,
    priceThb: (p.price_yuan ?? 0) * (p.exchange_rate ?? 1),
    importCost: p.import_cost ?? 0,
    costThb: p.cost_thb ?? 0,
    sellingPrice: p.selling_price ?? 0,
    status: p.product_status || "", // Use product_status column
    shipmentDate: p.shipment_date ? p.shipment_date.toString() : "",
    link: p.link || "",
    description: p.description || "",
    quantity: p.quantity ?? 0,
    options: p.options ?? [],
  };
}

// Helper: camelCase to snake_case for insert
function productToSupabaseInsert(product: Omit<Product, "id"> | Product) {
  // Ensure quantity is always a valid number, never null or undefined
  const quantity = typeof product.quantity === "number" && !isNaN(product.quantity) 
    ? product.quantity 
    : 0;

  // Use the first category from categories array, or fall back to category field
  const category = product.categories && product.categories.length > 0 
    ? product.categories[0] 
    : product.category || "";

  return {
    sku: product.sku,
    name: product.name,
    category: category, // Only use single category field that exists in DB
    product_type: product.productType || null,
    image: product.image,
    price_yuan: product.priceYuan,
    exchange_rate: product.exchangeRate,
    import_cost: product.importCost,
    cost_thb: product.costThb,
    selling_price: product.sellingPrice,
    product_status: product.status, // Use product_status column
    shipment_date:
      product.shipmentDate && product.shipmentDate !== ""
        ? product.shipmentDate
        : null,
    link: product.link,
    description: product.description,
    quantity: quantity,
    options: product.options ? (product.options as any) : undefined,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }

  return (data ?? []).map(supabaseProductToProduct);
}

export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  const obj = productToSupabaseInsert(product);
  console.log("addProduct: data to insert:", obj);
  // log ว่า fields สำคัญขาดหรือไม่
  ['sku', 'name', 'price_yuan', 'quantity'].forEach((key) => {
    if (!obj[key]) {
      console.warn(`Field "${key}" is missing or falsy in product insert!`);
    }
  });

  const { data, error } = await supabase
    .from('products')
    .insert([obj as any])
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error adding product:', error);
    alert(
      'Failed to add product: ' +
      (error.message || '') +
      (error.details ? '\nDetails: ' + error.details : '')
    );
    throw new Error('Failed to add product');
  }
  return supabaseProductToProduct(data);
}

export async function updateProduct(product: Product): Promise<Product> {
  const obj = productToSupabaseInsert(product);
  console.log("updateProduct: data to update:", obj, "ID:", product.id);
  const { data, error } = await supabase
    .from('products')
    .update({ ...obj, updated_at: new Date().toISOString() } as any)
    .eq('id', product.id)
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error updating product:', error);
    alert(
      'Failed to update product: ' +
      (error.message || '') +
      (error.details ? '\nDetails: ' + error.details : '')
    );
    throw new Error('Failed to update product');
  }
  return supabaseProductToProduct(data);
}

export async function deleteProduct(productId: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}
