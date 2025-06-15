
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image } from "lucide-react";

interface Product {
  id?: number;
  sku: string;
  name: string;
  category: string;
  image: string;
  priceYuan: number;
  exchangeRate: number;
  priceThb: number;
  importCost: number;
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
  onAddProduct: (product: any) => void;
  categories: string[];
  editingProduct?: Product | null;
}

const AddProductModal = ({ open, onOpenChange, onAddProduct, categories, editingProduct }: AddProductModalProps) => {
  const [formData, setFormData] = useState<Product>({
    sku: "",
    name: "",
    category: "",
    image: "",
    priceYuan: 0,
    exchangeRate: 1,
    priceThb: 0,
    importCost: 0,
    costThb: 0,
    sellingPrice: 0,
    status: "พรีออเดอร์",
    shipmentDate: "",
    link: "",
    description: ""
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    } else {
      setFormData({
        sku: "",
        name: "",
        category: "",
        image: "",
        priceYuan: 0,
        exchangeRate: 1,
        priceThb: 0,
        importCost: 0,
        costThb: 0,
        sellingPrice: 0,
        status: "พรีออเดอร์",
        shipmentDate: "",
        link: "",
        description: ""
      });
    }
  }, [editingProduct, open]);

  // Auto calculate total cost when priceThb or importCost changes
  useEffect(() => {
    const totalCost = formData.priceThb + formData.importCost;
    setFormData(prev => ({ ...prev, costThb: totalCost }));
  }, [formData.priceThb, formData.importCost]);

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
    
    // Reset form only if not editing
    if (!editingProduct) {
      setFormData({
        sku: "",
        name: "",
        category: "",
        image: "",
        priceYuan: 0,
        exchangeRate: 1,
        priceThb: 0,
        importCost: 0,
        costThb: 0,
        sellingPrice: 0,
        status: "พรีออเดอร์",
        shipmentDate: "",
        link: "",
        description: ""
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-800">
            {editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}
          </DialogTitle>
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
                className="border border-purple-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="name">ชื่อสินค้า *</Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อสินค้า"
                className="border border-purple-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">หมวดหมู่ *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="border border-purple-200 rounded-lg">
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
              className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer relative"
              onPaste={handlePaste}
            >
              {formData.image ? (
                <div className="space-y-2">
                  <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto" />
                  <p className="text-sm text-gray-600">คลิกเพื่อเปลี่ยนรูป หรือ Ctrl+V เพื่อวาง</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="w-12 h-12 mx-auto text-purple-400" />
                  <p className="text-purple-600">คลิกเพื่อเลือกรูป หรือ Ctrl+V เพื่อวาง</p>
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
                className="border border-purple-200 rounded-lg"
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
                className="border border-purple-200 rounded-lg"
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
                className="border border-purple-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="importCost">ค่านำเข้า (บาท)</Label>
              <Input 
                id="importCost"
                type="number"
                value={formData.importCost}
                onChange={(e) => setFormData({ ...formData, importCost: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="border border-purple-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="costThb">ต้นทุนรวม (บาท)</Label>
              <Input 
                id="costThb"
                type="number"
                value={formData.costThb}
                readOnly
                className="border border-purple-200 rounded-lg bg-gray-50"
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
                className="border border-purple-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">สถานะ</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="border border-purple-200 rounded-lg">
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
                className="border border-purple-200 rounded-lg"
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
              className="border border-purple-200 rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea 
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="รายละเอียดสินค้า"
              className="border border-purple-200 rounded-lg"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-purple-200">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
            disabled={!formData.name || !formData.category}
          >
            {editingProduct ? "บันทึกการแก้ไข" : "บันทึก"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
