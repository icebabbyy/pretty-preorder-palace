
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
  importCost: number;
  costThb: number;
  sellingPrice: number;
  status: string;
  shipmentDate: string;
  link: string;
  description: string;
  quantity?: number;
}

interface Order {
  id: number;
  product: string;
  productImage: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  cost: number;
  shippingCost: number;
  profit: number;
  status: string;
  orderDate: string;
  username: string;
  address: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const initializeData = () => {
      const savedCategories = localStorage.getItem('inventory-categories');
      const savedProducts = localStorage.getItem('inventory-products') || localStorage.getItem('products');
      const savedOrders = localStorage.getItem('stockOrders');
      
      if (savedCategories && savedProducts) {
        setCategories(JSON.parse(savedCategories));
        setProducts(JSON.parse(savedProducts));
        console.log('Loaded data from localStorage');
      } else {
        // Sample data
        const sampleCategories = [
          "League of Legends",
          "Valorant", 
          "Zenless Zone Zero",
          "Genshin Impact",
          "Honkai Star Rail",
          "Azur Lane",
          "Blue Archive",
          "ETC"
        ];
        
        const sampleProducts: Product[] = [
          {
            id: 1,
            sku: "LOL001",
            name: "League of Legends RP Card 1000",
            category: "League of Legends",
            image: "/placeholder.svg",
            priceYuan: 50,
            exchangeRate: 5.2,
            priceThb: 260,
            importCost: 20,
            costThb: 280,
            sellingPrice: 300,
            status: "พร้อมส่ง",
            shipmentDate: "2024-01-15",
            link: "https://example.com",
            description: "RP Card สำหรับเกม League of Legends",
            quantity: 5
          },
          {
            id: 2,
            sku: "VAL001",
            name: "Valorant Points 1000",
            category: "Valorant",
            image: "/placeholder.svg",
            priceYuan: 45,
            exchangeRate: 5.2,
            priceThb: 234,
            importCost: 15,
            costThb: 249,
            sellingPrice: 280,
            status: "พรีออเดอร์",
            shipmentDate: "2024-02-01",
            link: "https://example.com",
            description: "VP สำหรับเกม Valorant",
            quantity: 2
          }
        ];
        
        setCategories(sampleCategories);
        setProducts(sampleProducts);
        localStorage.setItem('inventory-categories', JSON.stringify(sampleCategories));
        localStorage.setItem('inventory-products', JSON.stringify(sampleProducts));
        localStorage.setItem('products', JSON.stringify(sampleProducts));
        console.log('Created initial sample data and saved to localStorage');
      }
      
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('inventory-products', JSON.stringify(products));
      localStorage.setItem('products', JSON.stringify(products));
      localStorage.setItem('stockProducts', JSON.stringify(products));
      console.log('Saved products to localStorage:', products.length);
    }
  }, [products]);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('stockOrders', JSON.stringify(orders));
    }
  }, [orders]);

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header - Purple gradient without buttons */}
      <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">ระบบการจัดการสต็อกสินค้า</h1>
              <p className="text-purple-100 mt-2">จัดการและติดตามสินค้าของคุณอย่างมีประสิทธิภาพ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Purple theme */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab("stock")}
            variant={activeTab === "stock" ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              activeTab === "stock" 
                ? "bg-purple-500 hover:bg-purple-600 text-white border border-purple-400" 
                : "bg-white border border-purple-300 text-purple-600 hover:bg-purple-50"
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
                ? "bg-purple-500 hover:bg-purple-600 text-white border border-purple-400" 
                : "bg-white border border-purple-300 text-purple-600 hover:bg-purple-50"
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
