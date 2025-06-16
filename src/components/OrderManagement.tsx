import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Package, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react";
import AddOrderModal from "./AddOrderModal";
import EditOrderModal from "./EditOrderModal";
import OrderStats from "./OrderStats";
import OrderStatusBanner from "./OrderStatusBanner";
import OrderFilterBar from "./OrderFilterBar";
import DateFilterBar from "./DateFilterBar";
import OrdersTable from "./OrdersTable";
import {
  fetchOrders,
  addOrder as addOrderToSupabase,
  updateOrder as updateOrderInSupabase,
  deleteOrder as deleteOrderFromSupabase,
} from "@/utils/orders";
import type { Product, Order, OrderItem } from "@/types";

interface OrderManagementProps {
  products: Product[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const OrderManagement = ({ products, orders, setOrders }: OrderManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      Array.isArray(order.items) &&
      order.items.some(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      order.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    // กรองตามเดือนและปีจาก paymentDate
    let matchesDate = true;
    if (order.paymentDate && (selectedMonth !== "all" || selectedYear !== "all")) {
      const paymentDate = new Date(order.paymentDate);
      if (selectedMonth !== "all") {
        const orderMonth = (paymentDate.getMonth() + 1).toString().padStart(2, '0');
        matchesDate = matchesDate && orderMonth === selectedMonth;
      }
      if (selectedYear !== "all") {
        const orderYear = paymentDate.getFullYear().toString();
        matchesDate = matchesDate && orderYear === selectedYear;
      }
    } else if (selectedMonth !== "all" || selectedYear !== "all") {
      // ถ้าไม่มีวันที่ชำระเงินแต่มีการเลือกกรอง ให้ไม่แสดงออเดอร์นั้น
      matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalSellingPrice ?? 0), 0);
  const totalCost = orders.reduce((sum, order) => sum + (order.totalCost ?? 0), 0);
  const totalProfit = totalRevenue - totalCost;

  const statusCounts = {
    "รอชำระเงิน": orders.filter(o => o.status === "รอชำระเงิน").length,
    "รอโรงงานจัดส่ง": orders.filter(o => o.status === "รอโรงงานจัดส่ง").length,
    "กำลังมาไทย": orders.filter(o => o.status === "กำลังมาไทย").length,
    "จัดส่งแล้ว": orders.filter(o => o.status === "จัดส่งแล้ว").length,
  };

  // ลบ order ใน Supabase
  const deleteOrder = async (orderId: number) => {
    try {
      await deleteOrderFromSupabase(orderId);
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('ไม่สามารถลบออเดอร์ได้');
    }
  };

  // เพิ่ม order ใหม่ใน Supabase
  const addOrder = async (newOrder: Omit<Order, 'id'>) => {
    try {
      const createdOrder = await addOrderToSupabase(newOrder);
      setOrders([...orders, createdOrder]);
    } catch (error) {
      console.error('Error adding order:', error);
      alert('ไม่สามารถเพิ่มออเดอร์ได้');
    }
  };

  // อัปเดต order ใน Supabase
  const updateOrder = async (updatedOrder: Order) => {
    try {
      const result = await updateOrderInSupabase(updatedOrder);
      setOrders(orders.map(order =>
        order.id === updatedOrder.id ? result : order
      ));
    } catch (error) {
      console.error('Error updating order:', error);
      alert('ไม่สามารถอัปเดตออเดอร์ได้');
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  // The updateOrderStatus function, now separate for OrdersTable
  const updateOrderStatus = (order: Order, newStatus: string) => {
    updateOrder({ ...order, status: newStatus });
  };

  return (
    <div>
      {/* Stats Cards */}
      <OrderStats
        totalRevenue={totalRevenue}
        totalCost={totalCost}
        totalProfit={totalProfit}
      />

      {/* Status Banner */}
      <OrderStatusBanner statusCounts={statusCounts} />

      {/* Search and Filters */}
      <div className="mb-6 bg-white border border-purple-200 rounded-xl shadow-sm">
        <div className="p-6 space-y-4">
          <OrderFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onAddOrderClick={() => setShowAddModal(true)}
          />
          
          <div className="border-t border-purple-100 pt-4">
            <DateFilterBar
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-purple-200 rounded-xl shadow-sm">
        <OrdersTable
          orders={filteredOrders}
          updateOrderStatus={updateOrderStatus}
          onEdit={handleEdit}
          onDelete={deleteOrder}
        />
      </div>

      <AddOrderModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddOrder={addOrder}
        products={products}
      />

      <EditOrderModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onUpdateOrder={updateOrder}
        order={editingOrder}
      />
    </div>
  );
};

export default OrderManagement;
