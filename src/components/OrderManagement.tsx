
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Clock, Truck, CheckCircle, Edit, Trash2, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AddOrderModal from "./AddOrderModal";

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

interface Product {
  id: number;
  sku: string;
  name: string;
  sellingPrice: number;
  costThb: number;
  image: string;
}

interface OrderManagementProps {
  products?: Product[];
}

const OrderManagement = ({ products = [] }: OrderManagementProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editableOrder, setEditableOrder] = useState<number | null>(null);
  const [editCost, setEditCost] = useState<string>("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "รอชำระเงิน":
        return <Clock className="w-4 h-4" />;
      case "รอจัดส่ง":
        return <Truck className="w-4 h-4" />;
      case "จัดส่งแล้ว":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "รอชำระเงิน":
        return "bg-yellow-200 text-yellow-800 border-yellow-300";
      case "รอจัดส่ง":
        return "bg-blue-200 text-blue-800 border-blue-300";
      case "จัดส่งแล้ว":
        return "bg-green-200 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const deleteOrder = (orderId: number) => {
    setOrders(orders.filter(order => order.id !== orderId));
  };

  const startEditCost = (orderId: number, currentCost: number) => {
    setEditableOrder(orderId);
    setEditCost(currentCost.toString());
  };

  const saveCost = (orderId: number) => {
    const newCost = parseFloat(editCost);
    setOrders(orders.map(order => 
      order.id === orderId ? { 
        ...order, 
        cost: newCost,
        profit: order.sellingPrice - newCost
      } : order
    ));
    setEditableOrder(null);
  };

  const addOrder = (newOrder: Omit<Order, 'id'>) => {
    const order: Order = {
      ...newOrder,
      id: Date.now()
    };
    setOrders([...orders, order]);
  };

  const groupedOrders = {
    "รอชำระเงิน": orders.filter(order => order.status === "รอชำระเงิน"),
    "รอจัดส่ง": orders.filter(order => order.status === "รอจัดส่ง"),
    "จัดส่งแล้ว": orders.filter(order => order.status === "จัดส่งแล้ว")
  };

  // Calculate totals
  const totalSales = orders.reduce((sum, order) => sum + order.sellingPrice, 0);
  const totalCost = orders.reduce((sum, order) => sum + order.cost, 0);
  const totalProfit = totalSales - totalCost;

  return (
    <div>
      {/* Add Order Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-purple-400 hover:bg-purple-500 text-purple-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มออเดอร์
        </Button>
      </div>

      {/* Summary Cards - Pastel Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-200 to-green-300 text-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600">มูลค่าขาย</p>
                <p className="text-2xl font-bold">฿{totalSales.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-200 to-red-300 text-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600">ต้นทุนรวม</p>
                <p className="text-2xl font-bold">฿{totalCost.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600">กำไรรวม</p>
                <p className="text-2xl font-bold">฿{totalProfit.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(groupedOrders).map(([status, statusOrders]) => (
          <Card key={status} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getStatusIcon(status)}
                {status}
                <Badge variant="secondary" className="ml-auto">
                  {statusOrders.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusOrders.map((order) => (
                <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Product Info */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={order.productImage} 
                        alt={order.product}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{order.product}</p>
                        <p className="text-sm text-gray-500">{order.orderDate}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {status !== "รอจัดส่ง" && (
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order.id, "รอจัดส่ง")}
                            >
                              <Truck className="w-4 h-4 mr-2" />
                              รอจัดส่ง
                            </DropdownMenuItem>
                          )}
                          {status !== "จัดส่งแล้ว" && (
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order.id, "จัดส่งแล้ว")}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              จัดส่งแล้ว
                            </DropdownMenuItem>
                          )}
                          {status !== "รอชำระเงิน" && (
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order.id, "รอชำระเงิน")}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              รอชำระเงิน
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => deleteOrder(order.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500 font-mono">{order.sku}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          x{order.quantity}
                        </Badge>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ราคาขาย:</span>
                        <span className="font-medium text-green-600">฿{order.sellingPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">ต้นทุน:</span>
                        {editableOrder === order.id ? (
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              value={editCost}
                              onChange={(e) => setEditCost(e.target.value)}
                              className="w-20 h-6 px-1 py-0 text-xs"
                              onBlur={() => saveCost(order.id)}
                              onKeyPress={(e) => e.key === 'Enter' && saveCost(order.id)}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span 
                            className="text-red-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
                            onClick={() => startEditCost(order.id, order.cost)}
                          >
                            ฿{order.cost.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-medium">กำไร:</span>
                        <span className={`font-bold ${order.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ฿{order.profit.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge className={`w-full justify-center ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </Badge>
                  </div>
                </Card>
              ))}

              {statusOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>ไม่มีออเดอร์ในสถานะนี้</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
