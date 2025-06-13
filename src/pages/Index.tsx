
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, DollarSign, Clock, ShoppingCart, AlertCircle } from "lucide-react";
import StockManagement from "@/components/StockManagement";
import OrderManagement from "@/components/OrderManagement";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for dashboard stats
  const stats = [
    {
      title: "สินค้าทั้งหมด",
      value: "3",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "มูลค่าขาย",
      value: "฿6,200",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "ต้นทุนรวม",
      value: "฿3,669.8",
      icon: DollarSign,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "กำไรรวม",
      value: "฿2,530.2",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "สต็อกหมด",
      value: "0",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "พรีออเดอร์",
      value: "3",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">ระบบการจัดการสต็อกสินค้า</h1>
              <p className="text-purple-100 mt-2">จัดการและติดตามสินค้าของคุณอย่างมีประสิทธิภาพ</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                + เพิ่มสินค้าใหม่
              </Button>
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                🗑 ลำงข้อมูล
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="stock" className="text-lg py-3">
              <Package className="w-5 h-5 mr-2" />
              สต็อกสินค้า
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-lg py-3">
              <ShoppingCart className="w-5 h-5 mr-2" />
              จัดการออเดอร์
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <StockManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
