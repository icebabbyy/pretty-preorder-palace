
import { supabase } from "@/integrations/supabase/client";
import { Product, Order } from "@/types";

// ----------- Product/Stock Management -----------

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
  
  return data || [];
}

// เพิ่มสินค้าใหม่
export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
  
  return data;
}

// แก้ไขสินค้า
export async function updateProduct(product: Product): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({
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
      options: product.options,
      updated_at: new Date().toISOString()
    })
    .eq('id', product.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
  
  return data;
}

// ลบสินค้า
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

// ดึง orders ทั้งหมด
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
  
  return data || [];
}

// เพิ่ม order ใหม่
export async function addOrder(order: Omit<Order, "id">): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      items: order.items,
      total_selling_price: order.totalSellingPrice,
      total_cost: order.totalCost,
      shipping_cost: order.shippingCost,
      deposit: order.deposit,
      discount: order.discount,
      profit: order.profit,
      status: order.status,
      order_date: order.orderDate,
      username: order.username,
      address: order.address
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding order:', error);
    throw new Error('Failed to add order');
  }
  
  return data;
}

// อัปเดต order
export async function updateOrder(order: Order): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({
      items: order.items,
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
    })
    .eq('id', order.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
  
  return data;
}

// ลบ order
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
