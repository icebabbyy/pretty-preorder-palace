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

import { Product } from "@/types";

// ----------- Product/Stock Management -----------

// ดึงสินค้าทั้งหมด
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// เพิ่มสินค้าใหม่
export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to add product");
  return res.json();
}

// แก้ไขสินค้า
export async function updateProduct(product: Product): Promise<Product> {
  const res = await fetch(`/api/products/${product.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

// ลบสินค้า
export async function deleteProduct(productId: number): Promise<void> {
  const res = await fetch(`/api/products/${productId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete product");
}
