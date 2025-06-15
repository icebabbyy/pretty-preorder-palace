import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image, Plus, Trash2 } from "lucide-react";

export interface ProductVariant {
  id: number;
  sku: string;
  name: string; // เช่น "แบบที่ 1"
  option: string; // เช่น "สีเหลือง", "แมว A"
  image: string;
  priceYuan: number;
  exchangeRate: number;
  priceThb: number;
  importCost: number;
  costThb: number;
  sellingPrice: number;
}

export interface Product {
  id?: number;
  name: string; // ชื่อสินค้าแม่
  category: string;
  status: string;
  description: string;
  variants: ProductVariant[];
}

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Product) => void;
  categories: string[];
  editingProduct?: Product | null;
}

// สร้าง variant เปล่า
const defaultVariant = (): ProductVariant => ({
  id: Date.now() + Math.random(), // unique-ish
  sku: "",
  name: "",
  option: "",
  image: "",
  priceYuan: 0,
  exchangeRate: 1,
  priceThb: 0,
  importCost: 0,
  costThb: 0,
  sellingPrice: 0,
});

const AddProductModal = ({
  open,
  onOpenChange,
  onAddProduct,
  categories,
  editingProduct
}: AddProductModalProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0] || "");
  const [status, setStatus] = useState("พรีออเดอร์");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([defaultVariant()]);

  // โหลดค่าเดิมตอน edit
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name ?? "");
      setCategory(editingProduct.category ?? categories[0] || "");
      setStatus(editingProduct.status ?? "พรีออเดอร์");
      setDescription(editingProduct.description ?? "");
      setVariants(editingProduct.variants?.length ? editingProduct.variants : [defaultVariant()]);
    } else {
      setName("");
      setCategory(categories[0] || "");
      setStatus("พรีออเดอร์");
      setDescription("");
      setVariants([defaultVariant()]);
    }
    // eslint-disable-next-line
  }, [editingProduct, open, categories]);

  // คำนวณอัตโนมัติในแต่ละ variant
  useEffect(() => {
    setVariants(variants =>
      variants.map(v => {
        const priceThb = v.priceYuan > 0 && v.exchangeRate > 0 ? parseFloat((v.priceYuan * v.exchangeRate).toFixed(2)) : 0;
        const costThb = priceThb + (v.importCost || 0);
        return { ...v, priceThb, costThb };
      })
    );
  }, [variants.map(v => [v.priceYuan, v.exchangeRate, v.importCost].join())]);

  // เพิ่ม/ลบ/แก้ไข variant
  const handleVariantChange = (idx: number, field: keyof ProductVariant, value: any) => {
    setVariants(variants =>
      variants.map((v, i) =>
        i === idx ? { ...v, [field]: value } : v
      )
    );
  };

  const handleVariantImage = (idx: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setVariants(variants =>
        variants.map((v, i) =>
          i === idx ? { ...v, image: e.target?.result as string } : v
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleAddVariant = () => setVariants(variants => [...variants, defaultVariant()]);
  const handleRemoveVariant = (idx: number) => setVariants(variants => variants.length > 1 ? variants.filter((_, i) => i !== idx) : variants);

  const handleSubmit = () => {
    if (!name || !category || !variants.length || variants.some(v => !v.name || !v.sku)) {
      alert("กรอกข้อมูลสินค้าและตัวเลือกให้ครบถ้วน");
      return;
    }
    onAddProduct({
      name,
      category,
      status,
      description,
      variants
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-800">
            {editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">ชื่อสินค้าแม่ *</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="เช่น ตุ๊กตาแมว ZZZ"
                className="border border-purple-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="category">หมวดหมู่ *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border border-purple-200 rounded-lg">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="status">สถานะ</Label>
            <Select value={status} onValueChange={setStatus}>
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
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="รายละเอียดสินค้าแม่"
              className="border border-purple-200 rounded-lg"
              rows={2}
            />
          </div>
          <div>
            <Label>ตัวเลือกสินค้า (Variant) <span className="font-normal text-sm text-gray-400">(เช่น สี แบบ ฯลฯ)</span></Label>
            {variants.map((v, idx) => (
              <div key={v.id} className="border rounded-lg mb-4 p-4 space-y-2 relative bg-gray-50">
                <div className="absolute right-2 top-2">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveVariant(idx)} disabled={variants.length === 1}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>SKU *</Label>
                    <Input
                      value={v.sku}
                      onChange={e => handleVariantChange(idx, "sku", e.target.value)}
                      placeholder="SKU เฉพาะตัวเลือก"
                      className="border border-purple-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label>ชื่อแบบ/option *</Label>
                    <Input
                      value={v.name}
                      onChange={e => handleVariantChange(idx, "name", e.target.value)}
                      placeholder="เช่น แมวเหลือง, แมวชมพู"
                      className="border border-purple-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label>รายละเอียดตัวเลือก</Label>
                    <Input
                      value={v.option}
                      onChange={e => handleVariantChange(idx, "option", e.target.value)}
                      placeholder="เช่น สีเหลือง/แบบที่ 1"
                      className="border border-purple-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  <div>
                    <Label>รูปภาพ</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => handleVariantImage(idx, e.target.files?.[0] || null)}
                    />
                    {v.image && (
                      <img src={v.image} alt="img" className="w-16 h-16 rounded mt-1 border border-purple-200" />
                    )}
                  </div>
                  <div>
                    <Label>ราคาหยวน</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={v.priceYuan}
                      onChange={e => handleVariantChange(idx, "priceYuan", parseFloat(e.target.value) || 0)}
                      className="border border-purple-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label>อัตราแลกเปลี่ยน</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={v.exchangeRate}
                      onChange={e => handleVariantChange(idx, "exchangeRate", parseFloat(e.target.value) || 1)}
                      className="border border-purple-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label>ราคาบาท (auto)</Label>
                    <Input
                      type="number"
                      value={v.priceThb}
                      readOnly
                      className="border border-purple-200 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <Label>ค่านำเข้า (บาท)</Label>
                    <Input
                      type="number"
                      value={v.importCost}
                      onChange={e => handleVariantChange(idx, "importCost", parseFloat(e.target.value) || 0)}
                      className="border border-purple-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label>ต้นทุนรวม (auto)</Label>
                    <Input
                      type="number"
                      value={v.costThb}
                      readOnly
                      className="border border-purple-200 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>ราคาขาย</Label>
                    <Input
                      type="number"
                      value={v.sellingPrice}
                      onChange={e => handleVariantChange(idx, "sellingPrice", parseFloat(e.target.value) || 0)}
                      className="border border-purple-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button onClick={handleAddVariant} variant="outline" className="mt-2 text-purple-600 border-purple-300">
              <Plus className="w-4 h-4 mr-1" /> เพิ่มตัวเลือกสินค้า
            </Button>
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
            disabled={!name || !category || !variants.length}
          >
            {editingProduct ? "บันทึกการแก้ไข" : "บันทึก"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
