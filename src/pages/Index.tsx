import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart } from "lucide-react";
import StockManagement from "@/components/StockManagement";
import OrderManagement from "@/components/OrderManagement";
import { useToast } from "@/components/ui/use-toast"; // 1. Import useToast
import type { Product, Order } from "@/types";

// เราจะใช้ API functions โดยตรงจากที่นี่เลย
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/utils/products";
import { fetchOrders } from "@/utils/orders";
import { fetchCategories } from "@/utils/categories";

const Index = () => {
  const { toast } = useToast(); // 2. เตรียมใช้งาน Toast
  const [activeTab, setActiveTab] = useState("stock");
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true); // เปลี่ยนชื่อเป็น loading ทั่วไป

  // 3. รวมการดึงข้อมูลทั้งหมดไว้ใน useEffect เดียว และป้องกัน Memory Leak
  useEffect(() => {
    let isMounted = true; // ตัวแปรสำหรับตรวจสอบว่า Component ยังทำงานอยู่หรือไม่

    const loadInitialData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลทั้งหมดพร้อมกันเพื่อความรวดเร็ว
        const [productsData, categoriesData, ordersData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchOrders(),
        ]);

        if (isMounted) { // ตรวจสอบก่อนอัปเดต State
          setProducts(productsData);
          setCategories(categoriesData);
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถโหลดข้อมูลเริ่มต้นได้: " + (error instanceof Error ? error.message : "Unknown error"),
          });
          // ตั้งค่า state เป็น array ว่างเพื่อให้ UI ไม่พัง
          setProducts([]);
          setCategories([]);
          setOrders([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    // Cleanup function: จะถูกเรียกเมื่อ Component ถูก unmount
    return () => {
      isMounted = false;
    };
  }, [toast]); // เพิ่ม toast เข้าไปใน dependency array

  // 4. สร้างฟังก์ชัน Handler สำหรับจัดการ State โดยเฉพาะ
  // ทำให้ Logic การอัปเดต State อยู่ที่นี่ที่เดียว
  const handleProductAdded = (newProduct: Product) => {
    setProducts(prevProducts => [...prevProducts, newProduct]);
    // อาจจะมีการอัปเดต categories ด้วย
    if (newProduct.category && !categories.includes(newProduct.category)) {
      setCategories(prevCategories => [...prevCategories, newProduct.category]);
    }
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleProductDeleted = (productId: number) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };
  
  // ส่วนของ JSX ที่มีการปรับปรุงเล็กน้อย
  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
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

      {/* Navigation */}
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
        {loading ? (
          <div className="text-center py-16 text-xl text-purple-400">
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <>
            {activeTab === "stock" && (
              <StockManagement
                products={products}
                categories={categories}
                // 5. ส่งฟังก์ชัน Handler ไปแทน setProducts
                onProductAdded={handleProductAdded}
                onProductUpdated={handleProductUpdated}
                onProductDeleted={handleProductDeleted}
                // ส่ง API functions ที่ import มาโดยตรง
                addProductAPI={addProduct}
                updateProductAPI={updateProduct}
                deleteProductAPI={deleteProduct}
              />
            )}
            {activeTab === "orders" && (
              <OrderManagement products={products} orders={orders} setOrders={setOrders} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
