
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ExternalLink, Edit, Trash2, Settings, Package } from "lucide-react";
import AddProductModal from "./AddProductModal";
import CategoryManagementModal from "./CategoryManagementModal";
import StockBanner from "./StockBanner";
import type { Product, ProductOption } from "@/types";

// -- products, categories APIs now come from new locations --
import {
  addProduct as addProductAPI,
  updateProduct as updateProductAPI,
  deleteProduct as deleteProductAPI,
} from "@/utils/products";
import {
  fetchCategories,
} from "@/utils/categories";

interface StockManagementProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  addProductAPI: (p: Omit<Product, "id">) => Promise<Product>;
  updateProductAPI: (p: Product) => Promise<Product>;
  deleteProductAPI: (id: number) => Promise<void>;
}

const StockManagement = ({
  products,
  setProducts,
  categories,
  setCategories,
  addProductAPI,
  updateProductAPI,
  deleteProductAPI
}: StockManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // 1. เพิ่มประสิทธิภาพด้วย useMemo
  const filteredProducts = useMemo(() => {
    // ย้าย console.log มาไว้ที่นี่เพื่อดูการ re-render ที่เกิดขึ้นจริง
    console.log("Filtering products..."); 
    return products.filter(product => {
      const productName = product.name || "";
      const productSku = product.sku || "";
      
      const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            productSku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || 
                              product.category === categoryFilter ||
                              (Array.isArray(product.categories) && product.categories.includes(categoryFilter));
                              
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]); // จะคำนวณใหม่เมื่อค่าเหล่านี้เปลี่ยนเท่านั้น

  const deleteProduct = async (productId: number) => {
    if (!confirm("คุณต้องการลบสินค้านี้หรือไม่?")) {
      return;
    }
    
    setDeletingProductId(productId);
    try {
      console.log('Starting delete for product:', productId);
      
      await deleteProductAPI(productId);
      
      // 2. ใช้ Functional Update เพื่อความปลอดภัยของ State
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      
      console.log("Product deleted successfully");
      
    } catch (error) {
      console.error('Delete product failed:', error);
      // 3. แสดง Error Message ที่เฉพาะเจาะจงมากขึ้น
      alert('เกิดข้อผิดพลาดในการลบสินค้า: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setDeletingProductId(null);
    }
  };

  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    setLoadingSave(true);
    try {
      const addedProd = await addProductAPI(newProduct);
      
      // 2. ใช้ Functional Update
      setProducts(prevProducts => [...prevProducts, addedProd]);
      
      console.log("After add, new product:", addedProd);

      // 2. ใช้ Functional Update กับ Categories ด้วย
      if (addedProd.category && !categories.includes(addedProd.category)) {
        setCategories(prevCategories => [...prevCategories, addedProd.category]);
      }
    } catch (error) {
      console.error('Add product failed:', error);
      // 3. แสดง Error Message ที่เฉพาะเจาะจงมากขึ้น
      alert('เกิดข้อผิดพลาดขณะบันทึกสินค้า: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoadingSave(false);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setLoadingSave(true);
    try {
      const returnedProd = await updateProductAPI(updatedProduct);
      
      // 2. ใช้ Functional Update
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === returnedProd.id ? returnedProd : p)
      );

      console.log("After update, updated product:", returnedProd);
    } catch (error) {
      console.error('Update product failed:', error);
      // 3. แสดง Error Message ที่เฉพาะเจาะจงมากขึ้น
      alert('เกิดข้อผิดพลาดขณะอัปเดตสินค้า: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoadingSave(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };
  
  // ส่วน JSX ที่เหลือ...
  return (
    <div>
      {/* Your JSX for search, filters, buttons, and product table goes here */}
    </div>
  );
};

  const getStockStatus = (quantity: number, status: string) => {
    if (status === "พร้อมส่ง" && quantity < 3) {
      return "สต็อคต่ำ";
    }
    return status;
  };

  const getStatusColor = (quantity: number, status: string) => {
    if (status === "พร้อมส่ง" && quantity < 3) {
      return "bg-red-100 text-red-800";
    }
    return status === 'พรีออเดอร์' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800';
  };

  // ฟังก์ชันแสดงตัวเลือกสินค้าอย่างมีประสิทธิภาพ
  const renderProductOptions = (options: ProductOption[] | undefined) => {
    if (!options || options.length === 0) {
      return <span className="text-xs text-gray-400">ไม่มีตัวเลือก</span>;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {options.map((option, index) => (
          <span
            key={option.id || index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-200"
          >
            {option.name}
            <span className="ml-1 text-purple-500">
              (฿{option.sellingPrice?.toLocaleString() || 0})
            </span>
          </span>
        ))}
      </div>
    );
  };

  // ฟังก์ชันแสดงหมวดหมู่หลายอัน
  const renderCategories = (product: Product) => {
    const displayCategories = product.categories && product.categories.length > 0 
      ? product.categories 
      : [product.category].filter(Boolean);

    if (displayCategories.length === 0) {
      return <span className="text-gray-400">ไม่มีหมวดหมู่</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {displayCategories.map((cat, index) => (
          <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            {cat}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Stock Banner */}
      <StockBanner products={products} />

      {/* Search and Filters */}
      <Card className="mb-6 bg-white border border-purple-200 rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาสินค้า SKU หรือชื่อสินค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border border-purple-200 rounded-lg"
                />
              </div>
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48 border border-purple-200 rounded-lg">
                    <SelectValue placeholder="หมวดหมู่ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCategoryModal(true)}
                  className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 border border-purple-200 rounded-lg">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
                  <SelectItem value="พร้อมส่ง">พร้อมส่ง</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => {
                  setEditingProduct(null);
                  setShowAddModal(true);
                }} 
                className="bg-purple-500 hover:bg-purple-600 text-white border border-purple-400 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มสินค้า
              </Button>

              <Button 
                className="bg-red-500 hover:bg-red-600 text-white border border-red-400 rounded-lg"
              >
                ลำดับลอต
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-white border border-purple-200 rounded-xl shadow-sm">
        <CardHeader className="border-b border-purple-100">
          <CardTitle className="text-purple-800">รายการสินค้า</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 border-b border-purple-100">
                  <TableHead className="text-purple-800 font-bold">รูปภาพ</TableHead>
                  <TableHead className="text-purple-800 font-bold">SKU</TableHead>
                  <TableHead className="text-purple-800 font-bold">ชื่อสินค้า</TableHead>
                  <TableHead className="text-purple-800 font-bold">หมวดหมู่</TableHead>
                  <TableHead className="text-purple-800 font-bold">ต้นทุน</TableHead>
                  <TableHead className="text-purple-800 font-bold">ราคาขาย</TableHead>
                  <TableHead className="text-purple-800 font-bold">จำนวน</TableHead>
                  <TableHead className="text-purple-800 font-bold">สถานะ</TableHead>
                  <TableHead className="text-purple-800 font-bold">ลิงก์</TableHead>
                  <TableHead className="text-purple-800 font-bold">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      ไม่มีสินค้าในระบบ กรุณาเพิ่มสินค้าใหม่
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const quantity = product.options && product.options.length > 0
                      ? product.options.reduce((acc, opt) => acc + (opt.quantity || 0), 0)
                      : product.quantity || 0;

                    // ใช้รูปแรกจาก images array หรือ fallback ไปยัง product.image
                    const displayImage = (product.images && product.images.length > 0) 
                      ? product.images[0].image_url 
                      : product.image;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={displayImage || "/placeholder.svg"}
                            alt={product.name || "Product"}
                            className="w-12 h-12 rounded-lg object-cover border border-purple-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-purple-600">{product.sku || ""}</TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium text-gray-900">{product.name || ""}</div>
                            {renderProductOptions(product.options)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderCategories(product)}
                        </TableCell>
                        <TableCell className="font-semibold text-red-600">
                          ฿{
                            product.options && product.options.length > 0
                              ? product.options[0].costThb.toLocaleString()
                              : (product.costThb ?? 0).toLocaleString()
                          }
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ฿{
                            product.options && product.options.length > 0
                              ? product.options[0].sellingPrice.toLocaleString()
                              : (product.sellingPrice ?? 0).toLocaleString()
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {
                            product.options && product.options.length > 0
                              ? product.options.reduce((acc, opt) => acc + (opt.quantity || 0), 0)
                              : product.quantity || 0
                          }
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quantity, product.status)}`}>
                            {getStockStatus(quantity, product.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild className="text-purple-600">
                            <a href={product.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-purple-600 hover:bg-purple-50"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => deleteProduct(product.id)}
                              disabled={deletingProductId === product.id}
                            >
                              {deletingProductId === product.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Product Modal */}
      <AddProductModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onAddProduct={editingProduct ? updateProduct : addProduct}
        categories={categories}
        editingProduct={editingProduct}
      />

      {/* Category Management Modal */}
      <CategoryManagementModal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        categories={categories}
        setCategories={setCategories}
      />
    </div>
  );
};

export default StockManagement;
