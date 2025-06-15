import { supabase } from "@/integrations/supabase/client";
import { Product, Order, OrderItem } from "@/types";

// Helper function: snake_case to camelCase for Product
function supabaseProductToProduct(p: any): Product {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category || "",
    image: p.image || "",
    priceYuan: p.price_yuan ?? 0,
    exchangeRate: p.exchange_rate ?? 5,
    priceThb: p.price_thb ?? 0,
    importCost: p.import_cost ?? 0,
    costThb: p.cost_thb ?? 0,
    sellingPrice: p.selling_price ?? 0,
    status: p.status || "",
    shipmentDate: p.shipment_date ? p.shipment_date.toString() : "",
    link: p.link || "",
    description: p.description || "",
    quantity: p.quantity ?? 0,
    options: p.options ?? []
  };
}

// Helper function: camelCase to snake_case for Product before insert
function productToSupabaseInsert(product: Omit<Product, "id">) {
  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    image: product.image,
    price_yuan: product.priceYuan,
    exchange_rate: product.exchangeRate,
    price_thb: product.priceThb,
    import_cost: product.importCost,
    cost_thb: product.costThb,
    selling_price: product.sellingPrice,
    status: product.status,
    shipment_date: product.shipmentDate,
    link: product.link,
    description: product.description,
    quantity: product.quantity,
    options: product.options ? (product.options as any) : undefined
  };
}

// ----------- Product/Stock Management -----------

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
  const { data, error } = await supabase
    .from('products')
    .insert([obj as any])
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
  return supabaseProductToProduct(data);
}

export async function updateProduct(product: Product): Promise<Product> {
  const obj = productToSupabaseInsert(product);
  const { data, error } = await supabase
    .from('products')
    .update({ ...obj, updated_at: new Date().toISOString() } as any)
    .eq('id', product.id)
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error updating product:', error);
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

// ----------- Order Management -----------
function supabaseOrderToOrder(o: any): Order {
  return {
    id: o.id,
    items: o.items,
    totalSellingPrice: o.total_selling_price ?? 0,
    totalCost: o.total_cost ?? 0,
    shippingCost: o.shipping_cost ?? 0,
    deposit: o.deposit ?? 0,
    discount: o.discount ?? 0,
    profit: o.profit ?? 0,
    status: o.status ?? "",
    orderDate: o.order_date ? o.order_date.toString() : "",
    username: o.username ?? "",
    address: o.address ?? ""
  };
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }

  return (data ?? []).map(supabaseOrderToOrder);
}

export async function addOrder(order: Omit<Order, "id">): Promise<Order> {
  // Map camelCase to snake_case for Supabase
  const supa = {
    items: order.items ? (order.items as any) : undefined,
    total_selling_price: order.totalSellingPrice,
    total_cost: order.totalCost,
    shipping_cost: order.shippingCost,
    deposit: order.deposit,
    discount: order.discount,
    profit: order.profit,
    status: order.status,
    order_date: order.orderDate,
    username: order.username,
    address: order.address,
  };
  const { data, error } = await supabase
    .from('orders')
    .insert([supa as any])
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error adding order:', error);
    throw new Error('Failed to add order');
  }
  return supabaseOrderToOrder(data);
}

export async function updateOrder(order: Order): Promise<Order> {
  const supa = {
    items: order.items ? (order.items as any) : undefined,
    total_selling_price: order.totalSellingPrice,
    total_cost: order.totalCost,
    shipping_cost: order.shippingCost,
    deposit: order.deposit,
    discount: order.discount,
    profit: order.profit,
    status: order.status,
    order_date: order.orderDate,
    username: order.username,
    address: order.address,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase
    .from('orders')
    .update(supa as any)
    .eq('id', order.id)
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
  return supabaseOrderToOrder(data);
}

export async function deleteOrder(orderId: number): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);
  if (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
}
