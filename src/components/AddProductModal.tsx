
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddProductModal = ({ open, onOpenChange }: AddProductModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [priceYuan, setPriceYuan] = useState("");
  const [exchangeRate, setExchangeRate] = useState("4.6");
  const [importCost, setImportCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [shipmentDate, setShipmentDate] = useState<Date>();
  const [orderCloseDate, setOrderCloseDate] = useState<Date>();

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

  const handleSubmit = () => {
    // Handle form submission here
    console.log({
      sku: autoSKU,
      category: selectedCategory,
      name: productName,
      priceYuan: parseFloat(priceYuan),
      exchangeRate: parseFloat(exchangeRate),
      thaiPrice: calculateThaiPrice(),
      importCost: parseFloat(importCost),
      totalCost: calculateTotalCost(),
      sellingPrice: parseFloat(sellingPrice),
      quantity: parseInt(quantity),
      description,
      link,
      shipmentDate,
      orderCloseDate
    });
    
    onOpenChange(false);
    // Reset form
    setSelectedCategory("");
    setProductName("");
    setPriceYuan("");
    setImportCost("");
    setSellingPrice("");
    setQuantity("");
    setDescription("");
    setLink("");
    setShipmentDate(undefined);
    setOrderCloseDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-700">+ เพิ่มออเดอร์</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Username" />
            </div>

            <div>
              <Label htmlFor="price-yuan">ราคา (ยวนโดย)</Label>
              <Input 
                id="price-yuan" 
                placeholder="ราคา (ยวนโดย)"
                value={priceYuan}
                onChange={(e) => setPriceYuan(e.target.value)}
                type="number"
              />
            </div>

            <div>
              <Label htmlFor="item-count">จำนวน</Label>
              <Input 
                id="item-count" 
                placeholder="จำนวน"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
              />
            </div>

            <div>
              <Label htmlFor="description">ข้อมูล</Label>
              <Textarea 
                id="description" 
                placeholder="ข้อมูล"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">เลือกสินค้า</Label>
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
                <Label>SKU อัตโนมัติ</Label>
                <Input value={autoSKU} readOnly className="bg-gray-100" />
              </div>
            )}

            <div>
              <Label htmlFor="product-name">ชื่อสินค้า</Label>
              <Input 
                id="product-name"
                placeholder="ชื่อสินค้า"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="exchange-rate">เรทเงินหยวน</Label>
                <Input 
                  id="exchange-rate"
                  placeholder="4.6"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  type="number"
                  step="0.1"
                />
              </div>
              <div>
                <Label>ราคาไทย (อัตโนมัติ)</Label>
                <Input value={calculateThaiPrice()} readOnly className="bg-gray-100" />
              </div>
            </div>

            <div>
              <Label htmlFor="import-cost">ค่านำเข้า</Label>
              <Input 
                id="import-cost"
                placeholder="ค่านำเข้า"
                value={importCost}
                onChange={(e) => setImportCost(e.target.value)}
                type="number"
              />
            </div>

            <div>
              <Label>ต้นทุนรวม (อัตโนมัติ)</Label>
              <Input value={calculateTotalCost()} readOnly className="bg-gray-100" />
            </div>

            <div>
              <Label htmlFor="selling-price">ราคาที่ขาย</Label>
              <Input 
                id="selling-price"
                placeholder="ราคาที่ขาย"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                type="number"
              />
            </div>

            <div>
              <Label htmlFor="link">Link (แหล่งสั่งของ)</Label>
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
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
