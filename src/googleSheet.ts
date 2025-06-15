
// ใช้ fetch ไปยัง API backend ที่คุณต้องสร้าง (เช่น /api/orders)
import { Order } from "@/types";

// ดึง orders ทั้งหมด
export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

// เพิ่ม order ใหม่
export async function addOrder(order: Omit<Order, "id">): Promise<Order> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error("Failed to add order");
  return res.json();
}

// อัปเดต order
export async function updateOrder(order: Order): Promise<Order> {
  const res = await fetch(`/api/orders/${order.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}

// ลบ order
export async function deleteOrder(orderId: number): Promise<void> {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete order");
}
