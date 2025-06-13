
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart } from "lucide-react";
import StockManagement from "@/components/StockManagement";
import OrderManagement from "@/components/OrderManagement";

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  image: string;
  priceYuan: number;
  exchangeRate: number;
  priceThb: number;
  costThb: number;
  sellingPrice: number;
  status: string;
  shipmentDate: string;
  link: string;
  description: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [products, setProducts] = useState<Product[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-300 to-purple-400 text-purple-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">ระบบการจัดการสต็อกสินค้า</h1>
              <p className="text-purple-600 mt-2">จัดการและติดตามสินค้าของคุณอย่างมีประสิทธิภาพ</p>
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
              activeTab === "stock" ? "bg-purple-400 hover:bg-purple-500 text-purple-800" : "border-purple-200 text-purple-600 hover:bg-purple-50"
            }`}
          >
            <Package className="w-5 h-5" />
            สต็อกสินค้า
          </Button>
          <Button
            onClick={() => setActiveTab("orders")}
            variant={activeTab === "orders" ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              activeTab === "orders" ? "bg-purple-400 hover:bg-purple-500 text-purple-800" : "border-purple-200 text-purple-600 hover:bg-purple-50"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            จัดการออเดอร์
          </Button>
        </div>

        {/* Content */}
        {activeTab === "stock" && (
          <StockManagement />
        )}
        {activeTab === "orders" && (
          <OrderManagement products={products} />
        )}
      </div>
    </div>
  );
};

export default Index;
