import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, ExternalLink, Edit, Trash2, Settings } from "lucide-react";
import AddProductModal from "./AddProductModal";
import CategoryManagementModal from "./CategoryManagementModal";
import { Product, ProductVariant } from "@/types/inventory";

interface StockManagementProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const StockManagement = ({ products, setProducts }: StockManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState([
    "League of Legends",
    "Valorant", 
    "Zenless Zone Zero",
    "Genshin Impact",
    "Honkai Star Rail",
    "Azur Lane",
    "Blue Archive",
    "ETC"
  ]);

  // DEBUG: log products for troubleshooting
  // Remove or comment after debugging
  // console.log("StockManagement products:", products);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const deleteProduct = (productId: number) => {
    if (confirm("คุณต้องการลบสินค้านี้หรือไม่?")) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  // ปรับให้รับ variants ด้วย เวลาสร้างใหม่ (แต่ logic หลักเหมือนเดิม)
  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProduct,
      id: Date.now()
    };
    setProducts([...products, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  // รวมจำนวนทั้งหมดของ variants ถ้ามี ถ้าไม่มีใช้ product.quantity
  const getSumVariantQuantity = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    }
    return product.quantity || 0;
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

  return (
    <div>
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
                // TODO: implement functionality for batch/lots
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
                    const quantity = getSumVariantQuantity(product);
                    return (
                      <TableRow key={product.id} className="hover:bg-purple-25 border-b border-purple-50">
                        <TableCell>
                          <img 
                            src={product.image || "/placeholder.svg"} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-purple-200"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-purple-600">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-sm text-purple-600">{product.category}</TableCell>
                        <TableCell className="font-semibold text-red-600">
                          ฿{(typeof product.costThb === "number" && product.costThb !== null
                            ? product.costThb 
                            : 0
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ฿{(typeof product.sellingPrice === "number" && product.sellingPrice !== null 
                            ? product.sellingPrice 
                            : 0
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{quantity}</TableCell>
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
                            >
                              <Trash2 className="w-4 h-4" />
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
