
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image } from "lucide-react";

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
  categories: string[];
}

const AddProductModal = ({ open, onOpenChange, onAddProduct, categories }: AddProductModalProps) => {
  const [formData, setFormData] = useState<Product>({
    sku: "",
    name: "",
    category: "",
    image: "",
    priceYuan: 0,
    exchangeRate: 1,
    priceThb: 0,
    costThb: 0,
    sellingPrice: 0,
    status: "พรีออเดอร์",
    shipmentDate: "",
    link: "",
    description: ""
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFormData({ ...formData, image: e.target?.result as string });
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      alert("กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่");
      return;
    }

    onAddProduct(formData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      sku: "",
      name: "",
      category: "",
      image: "",
      priceYuan: 0,
      exchangeRate: 1,
      priceThb: 0,
      costThb: 0,
      sellingPrice: 0,
      status: "พรีออเดอร์",
      shipmentDate: "",
      link: "",
      description: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-2 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-800">+ เพิ่มสินค้าใหม่</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input 
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="รหัสสินค้า"
                className="border-2 border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="name">ชื่อสินค้า *</Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อสินค้า"
                className="border-2 border-gray-300"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">หมวดหมู่ *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="border-2 border-gray-300">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>รูปภาพสินค้า</Label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
              onPaste={handlePaste}
            >
              {formData.image ? (
                <div className="space-y-2">
                  <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto" />
                  <p className="text-sm text-gray-600">คลิกเพื่อเปลี่ยนรูป หรือ Ctrl+V เพื่อวาง</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-gray-600">คลิกเพื่อเลือกรูป หรือ Ctrl+V เพื่อวาง</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priceYuan">ราคาหยวน</Label>
              <Input 
                id="priceYuan"
                type="number"
                value={formData.priceYuan}
                onChange={(e) => setFormData({ ...formData, priceYuan: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="border-2 border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="exchangeRate">อัตราแลกเปลี่ยน</Label>
              <Input 
                id="exchangeRate"
                type="number"
                step="0.01"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1 })}
                placeholder="1"
                className="border-2 border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="priceThb">ราคาบาท</Label>
              <Input 
                id="priceThb"
                type="number"
                value={formData.priceThb}
                onChange={(e) => setFormData({ ...formData, priceThb: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="border-2 border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costThb">ต้นทุน (บาท)</Label>
              <Input 
                id="costThb"
                type="number"
                value={formData.costThb}
                onChange={(e) => setFormData({ ...formData, costThb: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="border-2 border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="sellingPrice">ราคาขาย</Label>
              <Input 
                id="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="border-2 border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">สถานะ</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="border-2 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
                  <SelectItem value="พร้อมส่ง">พร้อมส่ง</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shipmentDate">วันที่จัดส่ง</Label>
              <Input 
                id="shipmentDate"
                type="date"
                value={formData.shipmentDate}
                onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })}
                className="border-2 border-gray-300"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="link">ลิงก์สินค้า</Label>
            <Input 
              id="link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://..."
              className="border-2 border-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea 
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="รายละเอียดสินค้า"
              className="border-2 border-gray-300"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-300">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-2 border-gray-800 hover:bg-gray-100"
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-gray-800 hover:bg-gray-700 text-white"
            disabled={!formData.name || !formData.category}
          >
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
