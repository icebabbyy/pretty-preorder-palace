
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart } from "lucide-react";
import StockManagement from "@/components/StockManagement";
import OrderManagement from "@/components/OrderManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("stock");

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
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab("stock")}
            variant={activeTab === "stock" ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              activeTab === "stock" ? "bg-purple-600 hover:bg-purple-700" : ""
            }`}
          >
            <Package className="w-5 h-5" />
            หน้าสต็อคสินค้า
          </Button>
          <Button
            onClick={() => setActiveTab("orders")}
            variant={activeTab === "orders" ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              activeTab === "orders" ? "bg-purple-600 hover:bg-purple-700" : ""
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            หน้าออเดอร์
          </Button>
        </div>

        {/* Content */}
        {activeTab === "stock" && <StockManagement />}
        {activeTab === "orders" && <OrderManagement />}
      </div>
    </div>
  );
};

export default Index;
