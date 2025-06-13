
import { useState, useEffect } from "react";
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

const Index = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('stockProducts');
    const savedOrders = localStorage.getItem('stockOrders');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('stockProducts', JSON.stringify(products));
  }, [products]);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('stockOrders', JSON.stringify(orders));
  }, [orders]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Clean white with dark border */}
      <div className="bg-white border-b-2 border-gray-800 text-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">ระบบการจัดการสต็อกสินค้า</h1>
              <p className="text-gray-600 mt-2">จัดการและติดตามสินค้าของคุณอย่างมีประสิทธิภาพ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Clean white with dark border */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab("stock")}
            variant={activeTab === "stock" ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              activeTab === "stock" 
                ? "bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-800" 
                : "bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-100"
            }`}
          >
            <Package className="w-5 h-5" />
            สต็อกสินค้า
          </Button>
          <Button
            onClick={() => setActiveTab("orders")}
            variant={activeTab === "orders" ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              activeTab === "orders" 
                ? "bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-800" 
                : "bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-100"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            จัดการออเดอร์
          </Button>
        </div>

        {/* Content */}
        {activeTab === "stock" && (
          <StockManagement products={products} setProducts={setProducts} />
        )}
        {activeTab === "orders" && (
          <OrderManagement products={products} orders={orders} setOrders={setOrders} />
        )}
      </div>
    </div>
  );
};

export default Index;
