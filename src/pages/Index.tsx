
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart } from "lucide-react";
import StockManagement from "@/components/StockManagement";
import OrderManagement from "@/components/OrderManagement";
import type { Product, Order } from "@/types";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct
} from "@/utils/googleSheets";

const Index = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // LOAD PRODUCTS จาก Google Sheets
  useEffect(() => {
    setLoadingProducts(true);
    fetchProducts()
      .then((prods) => {
        setProducts(prods);
        // unique categories from products
        const uniqCats = [...new Set(prods.map((p) => p.category).filter(Boolean))];
        setCategories(uniqCats);
      })
      .catch((err) => {
        alert('โหลดสินค้าจาก Google Sheets ไม่สำเร็จ');
        setProducts([]);
        setCategories([]);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  // orders ส่วนนี้ใช้ Google Sheets อยู่แล้ว
  useEffect(() => {
    const savedOrders = localStorage.getItem('stockOrders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      try {
        localStorage.setItem('stockOrders', JSON.stringify(orders));
      } catch (err: any) {
        alert('ข้อผิดพลาด: ออเดอร์เก็บใน localStorage เต็ม ไม่สามารถบันทึกได้ กรุณาลบออเดอร์บางส่วน');
        console.warn('QuotaExceeded saving orders to localStorage', err);
      }
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
          loadingProducts ? (
            <div className="text-center py-16 text-xl text-purple-400">
              กำลังโหลดสินค้า...
            </div>
          ) : (
            <StockManagement
              products={products}
              setProducts={setProducts}
              categories={categories}
              setCategories={setCategories}
              addProductAPI={addProduct}
              updateProductAPI={updateProduct}
              deleteProductAPI={deleteProduct}
            />
          )
        )}
        {activeTab === "orders" && (
          <OrderManagement products={products} orders={orders} setOrders={setOrders} />
        )}
      </div>
    </div>
  );
};

export default Index;

