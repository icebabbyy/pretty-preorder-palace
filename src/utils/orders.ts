
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/types";

// Helper function to convert supabase order to Order type
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
    paymentDate: o.payment_date ? o.payment_date.toString() : null,
    paymentSlip: o.payment_slip ?? null,
    username: o.username ?? "",
    address: o.address ?? "",
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
  const supabaseData = {
    items: order.items ? (order.items as any) : undefined,
    total_selling_price: order.totalSellingPrice,
    total_cost: order.totalCost,
    shipping_cost: order.shippingCost,
    deposit: order.deposit,
    discount: order.discount,
    profit: order.profit,
    status: order.status,
    order_date: order.orderDate,
    payment_date: order.paymentDate,
    payment_slip: order.paymentSlip,
    username: order.username,
    address: order.address,
  };
  
  console.log('Adding order with supabase data:', supabaseData);
  
  const { data, error } = await supabase
    .from('orders')
    .insert([supabaseData as any])
    .select()
    .maybeSingle();
    
  if (error) {
    console.error('Error adding order:', error);
    throw new Error('Failed to add order: ' + error.message);
  }
  
  if (!data) {
    throw new Error('No data returned from order insert');
  }
  
  return supabaseOrderToOrder(data);
}

export async function updateOrder(order: Order): Promise<Order> {
  const supabaseData = {
    items: order.items ? (order.items as any) : undefined,
    total_selling_price: order.totalSellingPrice,
    total_cost: order.totalCost,
    shipping_cost: order.shippingCost,
    deposit: order.deposit,
    discount: order.discount,
    profit: order.profit,
    status: order.status,
    order_date: order.orderDate,
    payment_date: order.paymentDate,
    payment_slip: order.paymentSlip,
    username: order.username,
    address: order.address,
    updated_at: new Date().toISOString(),
  };
  
  console.log('Updating order with data:', supabaseData);
  
  const { data, error } = await supabase
    .from('orders')
    .update(supabaseData as any)
    .eq('id', order.id)
    .select()
    .maybeSingle();
    
  if (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order: ' + error.message);
  }
  
  if (!data) {
    throw new Error('No data returned from order update');
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
