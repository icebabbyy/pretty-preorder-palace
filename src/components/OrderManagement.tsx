
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Clock, Truck, CheckCircle, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const OrderManagement = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      customerName: "น้องแมว",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop",
      product: "ฟิกฟิกฟิก",
      sku: "GEN-399994",
      quantity: 1,
      sellingPrice: 8200,
      cost: 8747,
      profit: -547,
      status: "รอชำระเงิน",
      orderDate: "15/7/2567"
    },
    {
      id: 2,
      customerName: "คุณสมใจ",
      avatar: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=100&h=100&fit=crop",
      product: "HSK - Pillow",
      sku: "HSR-368857",
      quantity: 2,
      sellingPrice: 760,
      cost: 723.24,
      profit: 36.76,
      status: "รอจัดส่ง",
      orderDate: "18/9/2568"
    },
    {
      id: 3,
      customerName: "พี่ใหญ่",
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop",
      product: "Figure Garen",
      sku: "LEA-F-123456",
      quantity: 1,
      sellingPrice: 1800,
      cost: 1449.8,
      profit: 350.2,
      status: "จัดส่งแล้ว",
      orderDate: "30/6/2568"
    }
  ];

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
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "รอจัดส่ง":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "จัดส่งแล้ว":
        return "bg-green-100 text-green-800 border-green-300";
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">มูลค่าขาย</p>
                <p className="text-2xl font-bold">฿{totalSales.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-400 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">ต้นทุนรวม</p>
                <p className="text-2xl font-bold">฿{totalCost.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-400 rounded-lg">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">กำไรรวม</p>
                <p className="text-2xl font-bold">฿{totalProfit.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-400 rounded-lg">
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
                    {/* Customer Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={order.avatar} />
                        <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{order.customerName}</p>
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
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            แก้ไข
                          </DropdownMenuItem>
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

                    {/* Product Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{order.product}</p>
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">ต้นทุน:</span>
                        <span className="text-red-600">฿{order.cost.toLocaleString()}</span>
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
    </div>
  );
};

export default OrderManagement;
