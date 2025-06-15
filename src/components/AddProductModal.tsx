import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductVariant {
  variantId: number;
  productId: number;
  sku: string;
  name: string;    // ชื่อแบบ/option เช่น "สีแดง ไซส์ S"
  option: string;  // ข้อมูลเพิ่ม เช่น "ไซส์ S", "รหัส ABC"
  image: string;
  priceThb: number;
  costThb: number;
  sellingPrice: number;
  quantity: number;
}

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
  variants: ProductVariant[];
}

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Product) => void;
  categories: string[];
  editingProduct?: Product | null;
}

const emptyVariant = (sku: string, index: number, productId = 0): ProductVariant => ({
  variantId: Date.now() + index,
  productId,
  sku: `${sku}-VAR${index + 1}`,
  name: "",
  option: "",
  image: "",
  priceThb: 0,
  costThb: 0,
  sellingPrice: 0,
  quantity: 0,
});

const AddProductModal = ({
  open,
  onOpenChange,
  onAddProduct,
  categories,
  editingProduct
}: AddProductModalProps) => {
  const [formData, setFormData] = useState<Omit<Product, "id" | "variants">>({
    sku: "",
    name: "",
    category: categories[0] ?? "",
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

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Auto SKU for product and variants
  useEffect(() => {
    if (!editingProduct && open) {
      const prefix = (formData.category?.[0] || "X").toUpperCase();
      const autoSku = `${prefix}${Date.now().toString().slice(-5)}`;
      setFormData(prev => ({
        ...prev,
        sku: prev.sku || autoSku
      }));
      setVariants([]); // reset variants
    }
    // eslint-disable-next-line
  }, [editingProduct, open]);

  // When SKU of product changes, update auto SKU for all variants
  useEffect(() => {
    setVariants(variants =>
      variants.map((v, i) => ({
        ...v,
        sku: `${formData.sku || "X"}-VAR${i + 1}`
      }))
    );
    // eslint-disable-next-line
  }, [formData.sku]);

  // คำนวณราคาไทยอัตโนมัติจาก หยวน * เรท
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      priceThb: parseFloat((prev.priceYuan * prev.exchangeRate).toFixed(2))
    }));
  }, [formData.priceYuan, formData.exchangeRate]);

  // Load editing product
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        sku: editingProduct.sku,
        name: editingProduct.name,
        category: editingProduct.category,
        image: editingProduct.image,
        priceYuan: editingProduct.priceYuan,
        exchangeRate: editingProduct.exchangeRate,
        priceThb: editingProduct.priceThb,
        importCost: editingProduct.importCost,
        costThb: editingProduct.costThb,
        sellingPrice: editingProduct.sellingPrice,
        status: editingProduct.status,
        shipmentDate: editingProduct.shipmentDate,
        link: editingProduct.link,
        description: editingProduct.description
      });
      setVariants(editingProduct.variants || []);
    }
  }, [editingProduct, open]);

  // Auto calculate total cost when priceThb or importCost changes
  useEffect(() => {
    const totalCost = formData.priceThb + formData.importCost;
    setFormData(prev => ({ ...prev, costThb: totalCost }));
  }, [formData.priceThb, formData.importCost]);

  const addVariant = () => {
    setVariants(variants => [
      ...variants,
      emptyVariant(formData.sku, variants.length)
    ]);
  };

  const updateVariant = (index: number, changes: Partial<ProductVariant>) => {
    setVariants(variants =>
      variants.map((v, i) =>
        i === index ? { ...v, ...changes, sku: `${formData.sku}-VAR${i + 1}` } : v
      )
    );
  };

  const removeVariant = (index: number) => {
    setVariants(variants =>
      variants.filter((_, i) => i !== index).map((v, i) => ({
        ...v,
        sku: `${formData.sku}-VAR${i + 1}`
      }))
    );
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.sku) {
      alert("กรุณากรอกข้อมูลสินค้าและ SKU ให้ครบ");
      return;
    }
    if (variants.length === 0) {
      alert("กรุณาเพิ่มตัวเลือกสินค้าอย่างน้อย 1 ตัวเลือก");
      return;
    }
    onAddProduct({
      ...formData,
      variants: variants.map((v, i) => ({
        ...v,
        variantId: v.variantId || Date.now() + i,
        productId: editingProduct?.id || 0,
        sku: `${formData.sku}-VAR${i + 1}`
      }))
    });
    onOpenChange(false);
    setFormData({
      sku: "",
      name: "",
      category: categories[0] ?? "",
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
    setVariants([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-700">{editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label htmlFor="sku">SKU สินค้าหลัก *</Label>
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
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label htmlFor="category">หมวดหมู่</Label>
              <Select value={formData.category} onValueChange={val => setFormData({ ...formData, category: val })}>
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
            <div>
              <Label htmlFor="image">ลิงก์รูปภาพหลัก</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="url รูปภาพ"
                className="border border-purple-200 rounded-lg"
              />
            </div>
          </div>
          {/* ราคาและต้นทุนสินค้าแม่ */}
          <div className="grid grid-cols-4 gap-6">
            <div>
              <Label>ราคา (หยวน)</Label>
              <Input
                type="number"
                value={formData.priceYuan}
                onChange={(e) => setFormData({ ...formData, priceYuan: parseFloat(e.target.value) || 0 })}
                className="border border-purple-200 rounded-lg"
              />
            </div>
            <div>
              <Label>เรทแลกเปลี่ยน</Label>
              <Input
                type="number"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1 })}
                className="border border-purple-200 rounded-lg"
              />
            </div>
            <div>
              <Label>ราคา (THB) (คำนวณอัตโนมัติ)</Label>
              <Input
                type="number"
                value={formData.priceThb}
                disabled
                className="border border-purple-200 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <Label>ค่าขนส่ง/นำเข้า (THB)</Label>
              <Input
                type="number"
                value={formData.importCost}
                onChange={(e) => setFormData({ ...formData, importCost: parseFloat(e.target.value) || 0 })}
                className="border border-purple-200 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <Label>ต้นทุนรวม (THB)</Label>
              <Input
                type="number"
                value={formData.costThb}
                disabled
                className="border border-purple-200 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <Label>ราคาขายหลัก (THB)</Label>
              <Input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="border border-purple-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="status">สถานะ</Label>
              <Select value={formData.status} onValueChange={val => setFormData({ ...formData, status: val })}>
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
              <Label>วันที่ของมา</Label>
              <Input
                type="date"
                value={formData.shipmentDate}
                onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })}
                className="border border-purple-200 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label>ลิงก์สินค้า/รายละเอียด</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="ลิงก์"
                className="border border-purple-200 rounded-lg"
              />
            </div>
            <div>
              <Label>รายละเอียดเพิ่มเติม</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดสินค้า"
                className="border border-purple-200 rounded-lg"
              />
            </div>
          </div>

          {/* Section สำหรับ variants */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-base">ตัวเลือกสินค้า (Variants) *</Label>
              <Button type="button" size="sm" onClick={addVariant} className="bg-purple-200 text-purple-800 hover:bg-purple-300">+ เพิ่มตัวเลือก</Button>
            </div>
            <div className="text-xs text-gray-500 mb-1">
              <span className="inline-block w-40">ชื่อแบบ/option:</span>
              <span className="inline-block w-32">รายละเอียด option:</span>
              <span className="inline-block w-40">ลิงก์รูปภาพ:</span>
              <span className="inline-block w-28">ราคาไทย (THB):</span>
              <span className="inline-block w-24">ต้นทุน (THB):</span>
              <span className="inline-block w-24">ราคาขาย (THB):</span>
              <span className="inline-block w-20">จำนวน:</span>
              <span className="inline-block w-32">SKU (Auto):</span>
            </div>
            {variants.length === 0 && (
              <div className="text-sm text-gray-400 mb-2">ยังไม่มีตัวเลือก</div>
            )}
            <div className="space-y-2">
              {variants.map((variant, idx) => (
                <div key={variant.variantId} className="border p-2 rounded-lg flex gap-2 items-center bg-purple-50">
                  <span className="text-xs px-2">{idx + 1}.</span>
                  <Input
                    value={variant.name}
                    onChange={e => updateVariant(idx, { name: e.target.value })}
                    placeholder="ชื่อแบบ/option เช่น สีแดง ไซส์ S"
                    className="border border-purple-200 rounded-lg w-40"
                  />
                  <Input
                    value={variant.option}
                    onChange={e => updateVariant(idx, { option: e.target.value })}
                    placeholder="รายละเอียด option เช่น ไซส์/รหัส"
                    className="border border-purple-200 rounded-lg w-32"
                  />
                  <Input
                    value={variant.image}
                    onChange={e => updateVariant(idx, { image: e.target.value })}
                    placeholder="ลิงก์รูปภาพ"
                    className="border border-purple-200 rounded-lg w-40"
                  />
                  <Input
                    type="number"
                    value={variant.priceThb}
                    onChange={e => updateVariant(idx, { priceThb: parseFloat(e.target.value) || 0 })}
                    placeholder="ราคาไทย (THB)"
                    className="border border-purple-200 rounded-lg w-28"
                  />
                  <Input
                    type="number"
                    value={variant.costThb}
                    onChange={e => updateVariant(idx, { costThb: parseFloat(e.target.value) || 0 })}
                    placeholder="ต้นทุน (THB)"
                    className="border border-purple-200 rounded-lg w-24"
                  />
                  <Input
                    type="number"
                    value={variant.sellingPrice}
                    onChange={e => updateVariant(idx, { sellingPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="ราคาขาย (THB)"
                    className="border border-purple-200 rounded-lg w-24"
                  />
                  <Input
                    type="number"
                    value={variant.quantity}
                    onChange={e => updateVariant(idx, { quantity: parseInt(e.target.value) || 0 })}
                    placeholder="จำนวน"
                    className="border border-purple-200 rounded-lg w-20"
                  />
                  <Input
                    value={variant.sku}
                    readOnly
                    className="border border-purple-200 rounded-lg w-32 bg-gray-100"
                    title="SKU ย่อย (Auto)"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removeVariant(idx)}
                  >
                    ลบ
                  </Button>
                </div>
              ))}
            </div>
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
            disabled={!formData.name || !formData.sku || variants.length === 0}
          >
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
