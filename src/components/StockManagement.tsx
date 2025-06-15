import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Settings, ExternalLink } from "lucide-react";
import AddProductModal, { Product, ProductVariant } from "./AddProductModal";
import CategoryManagementModal from "./CategoryManagementModal";

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

  // รวมชื่อสินค้ากับตัวเลือกทุก variant ใน filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      || product.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()) || v.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const deleteProduct = (productId: number) => {
    if (confirm("คุณต้องการลบสินค้านี้หรือไม่?")) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const addProduct = (newProduct: Product) => {
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
                  <TableHead>ชื่อสินค้าแม่</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>ตัวเลือก/แบบ</TableHead>
                  <TableHead>ราคาขาย</TableHead>
                  <TableHead>รูป</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      ไม่มีสินค้าในระบบ กรุณาเพิ่มสินค้าใหม่
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) =>
                    product.variants.length === 0 ? (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.status}</TableCell>
                        <TableCell colSpan={4} className="text-center text-gray-400">ไม่มีตัวเลือกสินค้า</TableCell>
                        <TableCell>
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
                            onClick={() => deleteProduct(product.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      product.variants.map((variant, idx) => (
                        <TableRow key={variant.id}>
                          {idx === 0 && (
                            <>
                              <TableCell rowSpan={product.variants.length}>{product.name}</TableCell>
                              <TableCell rowSpan={product.variants.length}>{product.category}</TableCell>
                              <TableCell rowSpan={product.variants.length}>{product.status}</TableCell>
                            </>
                          )}
                          <TableCell>{variant.sku}</TableCell>
                          <TableCell>{variant.name} {variant.option && <>({variant.option})</>}</TableCell>
                          <TableCell>฿{variant.sellingPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            {variant.image ? (
                              <img src={variant.image} alt={variant.name} className="w-14 h-14 object-cover rounded border" />
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {idx === 0 && (
                              <>
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
                                  onClick={() => deleteProduct(product.id!)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )
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
