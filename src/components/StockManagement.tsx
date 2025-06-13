
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, ExternalLink, Edit, Trash2 } from "lucide-react";
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
      margin: "164.9%",
      quantity: 2,
      status: "พรีออเดอร์",
      shipmentDate: "15/7/2567",
      link: "https://example.com"
    },
    {
      id: 2,
      sku: "HSR-368857",
      name: "HSK - Pillow",
      category: "Honkai Star Rail",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=100&h=100&fit=crop",
      priceYuan: 8276.38,
      exchangeRate: 4.62,
      priceThb: 380,
      costThb: 8103.62,
      margin: "37.5%",
      quantity: 10,
      status: "พรีออเดอร์",
      shipmentDate: "18/9/2568",
      link: "https://example.com"
    },
    {
      id: 3,
      sku: "LEA-F-123456",
      name: "Figure Garen",
      category: "League of Legends",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop",
      priceYuan: 81075.1,
      exchangeRate: 4.62,
      priceThb: 81800,
      costThb: 8724.9,
      margin: "0%",
      quantity: 0,
      status: "พรีออเดอร์",
      shipmentDate: "30/6/2568",
      link: "https://example.com"
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

  return (
    <div>
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="หมวดหมู่สินค้า" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
                  <SelectItem value="มีสต็อก">มีสต็อก</SelectItem>
                  <SelectItem value="หมด">หมด</SelectItem>
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

              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                ลำงข้อมูล
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
                  <TableHead className="text-purple-700">SKU</TableHead>
                  <TableHead className="text-purple-700">ชื่อสินค้า</TableHead>
                  <TableHead className="text-purple-700">หมวดหมู่</TableHead>
                  <TableHead className="text-purple-700">ต้นทุน</TableHead>
                  <TableHead className="text-purple-700">ราคาที่ขาย</TableHead>
                  <TableHead className="text-purple-700">กำไร</TableHead>
                  <TableHead className="text-purple-700">จำนวน</TableHead>
                  <TableHead className="text-purple-700">สถานะ</TableHead>
                  <TableHead className="text-purple-700">วันที่ส่ง</TableHead>
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
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>¥{product.priceYuan.toLocaleString()}</div>
                        <div className="text-gray-500">฿{product.costThb.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ฿{product.priceThb.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.margin === "0%" ? "destructive" : "default"}>
                        {product.margin}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.quantity === 0 ? "destructive" : "default"}>
                        {product.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={product.status === "พรีออเดอร์" ? "border-purple-300 text-purple-700" : ""}
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{product.shipmentDate}</TableCell>
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
                        <Button variant="ghost" size="sm" className="text-red-600">
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
