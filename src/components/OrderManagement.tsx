
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Package, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react";
import AddOrderModal from "./AddOrderModal";
import EditOrderModal from "./EditOrderModal";

interface Product {
  id: number;
  sku: string;
  name: string;
  sellingPrice: number;
  costThb: number;
  image: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

interface Order {
  id: number;
  items: OrderItem[];
  totalSellingPrice: number;
  totalCost: number;
  shippingCost: number;
  deposit: number;
  discount: number;
  profit: number;
  status: string;
  orderDate: string;
  username: string;
  address: string;
}

interface OrderManagementProps {
  products: Product[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const OrderManagement = ({ products, orders, setOrders }: OrderManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
  return matchesSearch && matchesStatus;
});

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalSellingPrice, 0);
  const totalCost = orders.reduce((sum, order) => sum + order.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;

  const statusCounts = {
    "รอชำระเงิน": orders.filter(o => o.status === "รอชำระเงิน").length,
    "รอโรงงานจัดส่ง": orders.filter(o => o.status === "รอโรงงานจัดส่ง").length,
    "กำลังมาไทย": orders.filter(o => o.status === "กำลังมาไทย").length,
    "จัดส่งแล้ว": orders.filter(o => o.status === "จัดส่งแล้ว").length,
  };

  const deleteOrder = (orderId: number) => {
    setOrders(orders.filter(o => o.id !== orderId));
  };

  const addOrder = (newOrder: Omit<Order, 'id'>) => {
    const order: Order = {
      ...newOrder,
      id: Date.now()
    };
    setOrders([...orders, order]);
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "รอชำระเงิน": return <AlertCircle className="w-5 h-5" />;
      case "รอโรงงานจัดส่ง": return <Clock className="w-5 h-5" />;
      case "กำลังมาไทย": return <Truck className="w-5 h-5" />;
      case "จัดส่งแล้ว": return <CheckCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "รอชำระเงิน": return "text-yellow-600 bg-yellow-100";
      case "รอโรงงานจัดส่ง": return "text-orange-600 bg-orange-100";
      case "กำลังมาไทย": return "text-blue-600 bg-blue-100";
      case "จัดส่งแล้ว": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white border border-purple-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">มูลค่าขาย</p>
                <p className="text-2xl font-bold text-green-600">฿{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-purple-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">ต้นทุนรวม</p>
                <p className="text-2xl font-bold text-red-600">฿{totalCost.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-purple-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">กำไรรวม</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ฿{totalProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="bg-white border border-purple-200 rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </div>
                <div>
                  <p className="text-xs text-gray-600">{status}</p>
                  <p className="text-lg font-bold text-gray-800">{count} ออเดอร์</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 bg-white border border-purple-200 rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาออเดอร์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border border-purple-200 rounded-lg"
                />
              </div>
            </div>
            
            <div className="flex gap-3 items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border border-purple-200 rounded-lg">
                  <SelectValue placeholder="สถานะทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                  <SelectItem value="รอชำระเงิน">รอชำระเงิน</SelectItem>
                  <SelectItem value="รอโรงงานจัดส่ง">รอโรงงานจัดส่ง</SelectItem>
                  <SelectItem value="กำลังมาไทย">กำลังมาไทย</SelectItem>
                  <SelectItem value="จัดส่งแล้ว">จัดส่งแล้ว</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => setShowAddModal(true)} 
                className="bg-purple-500 hover:bg-purple-600 text-white border border-purple-400 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มออเดอร์
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-white border border-purple-200 rounded-xl shadow-sm">
        <CardHeader className="border-b border-purple-100">
          <CardTitle className="text-purple-800">รายการออเดอร์</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 border-b border-purple-100">
                  <TableHead className="text-purple-800 font-bold">สินค้า</TableHead>
                  <TableHead className="text-purple-800 font-bold">ลูกค้า</TableHead>
                  <TableHead className="text-purple-800 font-bold">ราคาขาย</TableHead>
                  <TableHead className="text-purple-800 font-bold">ส่วนลด</TableHead>
                  <TableHead className="text-purple-800 font-bold">ต้นทุน</TableHead>
                  <TableHead className="text-purple-800 font-bold">กำไร</TableHead>
                  <TableHead className="text-purple-800 font-bold">สถานะ</TableHead>
                  <TableHead className="text-purple-800 font-bold">วันที่</TableHead>
                  <TableHead className="text-purple-800 font-bold">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      ไม่มีออเดอร์ในระบบ กรุณาเพิ่มออเดอร์ใหม่
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-purple-25 border-b border-purple-50">
                      <TableCell>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <img 
                                src={item.productImage} 
                                alt={item.productName}
                                className="w-8 h-8 rounded object-cover border border-purple-200"
                              />
                              <div>
                                <p className="text-sm font-medium">{item.productName}</p>
                                <p className="text-xs text-purple-500">{item.sku} x{item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-purple-700">{order.username}</p>
                          {order.deposit > 0 && (
                            <p className="text-xs text-green-600">มัดจำ: ฿{order.deposit.toLocaleString()}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ฿{order.totalSellingPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {order.discount > 0 ? `-฿${order.discount.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        ฿{order.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell className={`font-semibold ${order.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ฿{order.profit.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{order.orderDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-purple-600 hover:bg-purple-50"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => deleteOrder(order.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
