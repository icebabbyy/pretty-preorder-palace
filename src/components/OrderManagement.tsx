
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, ShoppingCart, Package } from "lucide-react";
import AddOrderModal from "./AddOrderModal";

interface Product {
  id: number;
  sku: string;
  name: string;
  sellingPrice: number;
  costThb: number;
  image: string;
}

interface Order {
  id: number;
  product: string;
  productImage: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  cost: number;
  profit: number;
  status: string;
  orderDate: string;
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
  const [editingCost, setEditingCost] = useState<number | null>(null);
  const [editCostValue, setEditCostValue] = useState("");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.sellingPrice, 0);
  const totalCost = orders.reduce((sum, order) => sum + order.cost, 0);
  const totalProfit = totalRevenue - totalCost;

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

  const handleCostEdit = (orderId: number, currentCost: number) => {
    setEditingCost(orderId);
    setEditCostValue(currentCost.toString());
  };

  const saveCostEdit = (orderId: number) => {
    const newCost = parseFloat(editCostValue) || 0;
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const newProfit = order.sellingPrice - newCost;
        return { ...order, cost: newCost, profit: newProfit };
      }
      return order;
    }));
    setEditingCost(null);
    setEditCostValue("");
  };

  const cancelCostEdit = () => {
    setEditingCost(null);
    setEditCostValue("");
  };

  return (
    <div>
      {/* Stats Cards - Purple theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  <SelectItem value="รอจัดส่ง">รอจัดส่ง</SelectItem>
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
                  <TableHead className="text-purple-800 font-bold">รูปสินค้า</TableHead>
                  <TableHead className="text-purple-800 font-bold">สินค้า</TableHead>
                  <TableHead className="text-purple-800 font-bold">จำนวน</TableHead>
                  <TableHead className="text-purple-800 font-bold">ราคาขาย</TableHead>
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
                        <img 
                          src={order.productImage} 
                          alt={order.product}
                          className="w-12 h-12 rounded-lg object-cover border border-purple-200"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.product}</p>
                          <p className="text-sm text-purple-500">{order.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{order.quantity}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ฿{order.sellingPrice.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {editingCost === order.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editCostValue}
                              onChange={(e) => setEditCostValue(e.target.value)}
                              className="w-20 h-8 text-sm border border-purple-200"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') saveCostEdit(order.id);
                                if (e.key === 'Escape') cancelCostEdit();
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => saveCostEdit(order.id)}
                              className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelCostEdit}
                              className="h-6 px-2 text-xs border border-purple-200"
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className="font-semibold text-red-600 cursor-pointer hover:bg-purple-50 px-2 py-1 rounded"
                            onClick={() => handleCostEdit(order.id, order.cost)}
                          >
                            ฿{order.cost.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={`font-semibold ${order.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ฿{order.profit.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'รอชำระเงิน' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'รอจัดส่ง' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{order.orderDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">
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

      {/* Add Order Modal */}
      <AddOrderModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onAddOrder={addOrder}
        products={products}
      />
    </div>
  );
};

export default OrderManagement;
