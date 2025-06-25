// src/components/StockManagement.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import AddProductModal from "./AddProductModal";
import type { Product } from "@/types";
import { toast } from "sonner";
import { upsertProduct, deleteProduct as deleteProductAPI } from "@/utils/products"; // <--- แก้ไข Import

interface StockManagementProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
}

const StockManagement = ({ products, setProducts, categories }: StockManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(p => 
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = async (productData: Product) => {
    setIsSubmitting(true);
    try {
      const savedProduct = await upsertProduct(productData); // <--- แก้ไข: เรียกใช้ฟังก์ชันเดียว
      
      if (editingProduct) {
        setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
      } else {
        setProducts([savedProduct, ...products]);
      }
      
      toast.success(`บันทึกข้อมูล "${savedProduct.name}" สำเร็จ`);
      setShowAddModal(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;
    try {
      await deleteProductAPI(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast.success("ลบสินค้าสำเร็จ");
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการลบ: " + error.message);
    }
  };

  return (
    <div>
      <Card className="mb-6"><CardContent className="p-4"><div className="flex justify-between items-center gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><Input placeholder="ค้นหา SKU หรือชื่อสินค้า..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div><Button onClick={() => { setEditingProduct(null); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />เพิ่มสินค้า</Button></div></CardContent></Card>
      <Card><CardHeader><CardTitle>รายการสินค้า ({filteredProducts.length} รายการ)</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="w-[80px]">รูปภาพ</TableHead><TableHead>ชื่อสินค้า</TableHead><TableHead>จำนวนคงเหลือ</TableHead><TableHead className="w-[100px]">จัดการ</TableHead></TableRow></TableHeader><TableBody>{filteredProducts.length > 0 ? (filteredProducts.map((product) => (<TableRow key={product.id}><TableCell><img src={product.image || '/placeholder.svg'} alt={product.name} className="w-12 h-12 object-cover rounded-md" /></TableCell><TableCell className="font-medium">{product.name}</TableCell><TableCell>{product.quantity || 0}</TableCell><TableCell><div className="flex gap-2"><Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}><Edit className="w-4 h-4" /></Button><Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id!)}><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))) : (<TableRow><TableCell colSpan={4} className="text-center h-24">ไม่พบสินค้า</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
      {showAddModal && (
        <AddProductModal 
          open={showAddModal} 
          onOpenChange={setShowAddModal}
          onAddProduct={handleSaveProduct} // <--- แก้ไข: ส่ง handler ตัวใหม่ไป
          categories={categories}
          editingProduct={editingProduct}
        />
      )}
    </div>
  );
};

export default StockManagement;
