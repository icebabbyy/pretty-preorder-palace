
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, ExternalLink, Edit, Trash2, Settings } from "lucide-react";
import AddProductModal from "./AddProductModal";

const StockManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock product data
  const products = [
    {
      id: 1,
      sku: "GEN-399994",
      name: "ฟิกฟิกฟิก",
      category: "Genshin Impact",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&h=100&fit=crop",
      priceYuan: 845,
      exchangeRate: 4.6,
      priceThb: 8200,
      costThb: 8747,
      sellingPrice: 8200,
      status: "พรีออเดอร์",
      shipmentDate: "15/7/2567",
      link: "https://example.com",
      description: "รายละเอียดสินค้า"
    },
    {
      id: 2,
      sku: "HSR-368857",
      name: "HSK - Pillow",
      category: "Honkai Star Rail",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=100&h=100&fit=crop",
      priceYuan: 82.76,
      exchangeRate: 4.62,
      priceThb: 380,
      costThb: 362.24,
      sellingPrice: 380,
      status: "พร้อมส่ง",
      shipmentDate: "18/9/2568",
      link: "https://example.com",
      description: "รายละเอียดสินค้า"
    },
    {
      id: 3,
      sku: "LEA-F-123456",
      name: "Figure Garen",
      category: "League of Legends",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop",
      priceYuan: 810.75,
      exchangeRate: 4.62,
      priceThb: 1800,
      costThb: 1449.8,
      sellingPrice: 1800,
      status: "พรีออเดอร์",
      shipmentDate: "30/6/2568",
      link: "https://example.com",
      description: "รายละเอียดสินค้า"
    }
  ];

  const categories = [
    "League of Legends",
    "Valorant", 
    "Zenless Zone Zero",
    "Genshin Impact",
    "Honkai Star Rail",
    "Azur Lane",
    "Blue Archive",
    "ETC"
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.status === "พร้อมส่ง").length;
  const preOrderProducts = products.filter(p => p.status === "พรีออเดอร์").length;

  const deleteProduct = (productId: number) => {
    console.log("Delete product:", productId);
    // Implementation for deleting product
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">สินค้าทั้งหมด</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-400 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">พร้อมส่ง</p>
                <p className="text-2xl font-bold">{inStockProducts}</p>
              </div>
              <div className="p-3 bg-green-400 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">พรีออเดอร์</p>
                <p className="text-2xl font-bold">{preOrderProducts}</p>
              </div>
              <div className="p-3 bg-purple-400 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาสินค้า SKU หรือชื่อสินค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="หมวดหมู่ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
                  <SelectItem value="พร้อมส่ง">พร้อมส่ง</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มสินค้า
              </Button>

              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                ตัวกรอง
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-700">รายการสินค้า</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50">
                  <TableHead className="text-purple-700">รูปภาพ</TableHead>
                  <TableHead className="text-purple-700">ชื่อสินค้า</TableHead>
                  <TableHead className="text-purple-700">ราคา</TableHead>
                  <TableHead className="text-purple-700">วันที่จัดส่ง</TableHead>
                  <TableHead className="text-purple-700">รายละเอียด</TableHead>
                  <TableHead className="text-purple-700">ลิงก์</TableHead>
                  <TableHead className="text-purple-700">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ฿{product.sellingPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">{product.shipmentDate}</TableCell>
                    <TableCell className="text-sm">{product.description}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={product.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <AddProductModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  );
};

export default StockManagement;
