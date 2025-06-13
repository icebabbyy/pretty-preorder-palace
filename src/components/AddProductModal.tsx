
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Upload } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Product {
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

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Product) => void;
}

const AddProductModal = ({ open, onOpenChange, onAddProduct }: AddProductModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [priceYuan, setPriceYuan] = useState("");
  const [exchangeRate, setExchangeRate] = useState("4.6");
  const [importCost, setImportCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [shipmentDate, setShipmentDate] = useState<Date>();
  const [orderCloseDate, setOrderCloseDate] = useState<Date>();
  const [productImage, setProductImage] = useState("");
  const [status, setStatus] = useState("พรีออเดอร์");

  const categories = [
    { name: "League of Legends", code: "LOL" },
    { name: "Valorant", code: "VAL" },
    { name: "Zenless Zone Zero", code: "ZZZ" },
    { name: "Genshin Impact", code: "GEN" },
    { name: "Honkai Star Rail", code: "HSR" },
    { name: "Azur Lane", code: "AZL" },
    { name: "Blue Archive", code: "BLUE" },
    { name: "ETC", code: "ETC" }
  ];

  // Auto generate SKU
  const generateSKU = (categoryCode: string) => {
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    return `${categoryCode}-${randomNumber}`;
  };

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);
  const autoSKU = selectedCategoryData ? generateSKU(selectedCategoryData.code) : "";

  // Calculate Thai price from Yuan
  const calculateThaiPrice = () => {
    if (priceYuan && exchangeRate) {
      return (parseFloat(priceYuan) * parseFloat(exchangeRate)).toFixed(2);
    }
    return "";
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    const thaiPrice = calculateThaiPrice();
    if (thaiPrice && importCost) {
      return (parseFloat(thaiPrice) + parseFloat(importCost)).toFixed(2);
    }
    return "";
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setProductImage(e.target?.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleSubmit = () => {
    if (!productName || !selectedCategory || !sellingPrice) {
      alert("กรุณากรอกข้อมูลที่จำเป็น");
      return;
    }

    const newProduct: Product = {
      sku: autoSKU,
      category: selectedCategory,
      name: productName,
      priceYuan: parseFloat(priceYuan) || 0,
      exchangeRate: parseFloat(exchangeRate),
      priceThb: parseFloat(calculateThaiPrice()) || 0,
      costThb: parseFloat(calculateTotalCost()) || 0,
      sellingPrice: parseFloat(sellingPrice),
      description,
      link,
      shipmentDate: shipmentDate ? format(shipmentDate, "dd/MM/yyyy") : "",
      image: productImage || "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&h=100&fit=crop",
      status
    };
    
    onAddProduct(newProduct);
    onOpenChange(false);
    
    // Reset form
    setSelectedCategory("");
    setProductName("");
    setPriceYuan("");
    setImportCost("");
    setSellingPrice("");
    setDescription("");
    setLink("");
    setShipmentDate(undefined);
    setOrderCloseDate(undefined);
    setProductImage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-700">+ เพิ่มสินค้าใหม่</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6" onPaste={handlePaste}>
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">หมวดหมู่สินค้า</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่สินค้า" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.code} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div>
                <Label>SKU (สร้างอัตโนมัติ)</Label>
                <Input value={autoSKU} readOnly className="bg-gray-100" />
              </div>
            )}

            <div>
              <Label htmlFor="product-name">ชื่อสินค้า</Label>
              <Input 
                id="product-name"
                placeholder="กรอกชื่อสินค้า"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">สถานะสินค้า</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
                  <SelectItem value="พร้อมส่ง">พร้อมส่ง</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="image">รูปสินค้า</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400">
                    {productImage ? (
                      <img src={productImage} alt="Product" className="max-h-32 mx-auto rounded" />
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">คลิกเพื่ออัพโหลด หรือ Ctrl+V เพื่อวาง</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea 
                id="description" 
                placeholder="รายละเอียดสินค้า"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-700">ข้อมูลราคาและต้นทุน</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price-yuan">ราคาหยวน (¥)</Label>
                  <Input 
                    id="price-yuan" 
                    placeholder="0"
                    value={priceYuan}
                    onChange={(e) => setPriceYuan(e.target.value)}
                    type="number"
                  />
                </div>
                <div>
                  <Label htmlFor="exchange-rate">เรทแลกเปลี่ยน</Label>
                  <Input 
                    id="exchange-rate"
                    placeholder="4.6"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    type="number"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <Label>ราคาไทย (฿) [คำนวณอัตโนมัติ]</Label>
                <Input value={calculateThaiPrice()} readOnly className="bg-gray-100" />
              </div>

              <div>
                <Label htmlFor="import-cost">ค่านำเข้า (฿)</Label>
                <Input 
                  id="import-cost"
                  placeholder="0"
                  value={importCost}
                  onChange={(e) => setImportCost(e.target.value)}
                  type="number"
                />
              </div>

              <div>
                <Label>ต้นทุนรวม (฿) [คำนวณอัตโนมัติ]</Label>
                <Input value={calculateTotalCost()} readOnly className="bg-gray-100" />
              </div>

              <div>
                <Label htmlFor="selling-price">ราคาขาย (฿)</Label>
                <Input 
                  id="selling-price"
                  placeholder="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  type="number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="link">ลิงก์แหล่งสั่งของ</Label>
              <Input 
                id="link"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                type="url"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>วันที่จัดส่ง</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !shipmentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {shipmentDate ? format(shipmentDate, "dd/MM/yyyy") : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={shipmentDate}
                      onSelect={setShipmentDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>วันปิดรับออเดอร์</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !orderCloseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {orderCloseDate ? format(orderCloseDate, "dd/MM/yyyy") : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={orderCloseDate}
                      onSelect={setOrderCloseDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} className="bg-purple-400 hover:bg-purple-500 text-purple-800">
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
