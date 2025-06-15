
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, ProductVariant } from "@/types/inventory";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Omit<Product, "id">) => void;
  categories: string[];
  editingProduct: Product | null;
}

const initialVariant = (): ProductVariant => ({
  variantId: Date.now(),
  productId: 0,
  sku: "",
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
  editingProduct,
}: AddProductModalProps) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [costThb, setCostThb] = useState<number | null>(null);
  const [sellingPrice, setSellingPrice] = useState<number | null>(null);
  const [status, setStatus] = useState("พร้อมส่ง");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setSku(editingProduct.sku || "");
      setCategory(editingProduct.category || "");
      setImage(editingProduct.image || "");
      setDescription(editingProduct.description || "");
      setCostThb(editingProduct.costThb ?? null);
      setSellingPrice(editingProduct.sellingPrice ?? null);
      setStatus(editingProduct.status || "พร้อมส่ง");
      setLink(editingProduct.link || "");
      setQuantity(editingProduct.quantity || 0);
      setVariants(editingProduct.variants || []);
    } else {
      setName("");
      setSku("");
      setCategory("");
      setImage("");
      setDescription("");
      setCostThb(null);
      setSellingPrice(null);
      setStatus("พร้อมส่ง");
      setLink("");
      setQuantity(0);
      setVariants([]);
    }
  }, [editingProduct, open]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        ...initialVariant(),
        variantId: Date.now(),
        productId: editingProduct?.id || 0,
      },
    ]);
  };

  const handleVariantChange = (
    idx: number,
    key: keyof ProductVariant,
    value: string | number
  ) => {
    setVariants(
      variants.map((v, vi) =>
        vi === idx ? { ...v, [key]: value } : v
      )
    );
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants(variants.filter((_, vi) => vi !== idx));
  };

  const handleSubmit = () => {
    if (!name || !sku || !category) {
      alert("กรุณากรอกข้อมูลที่จำเป็น");
      return;
    }

    const product: Omit<Product, "id"> = {
      sku,
      name,
      category,
      image,
      priceYuan: undefined, // Not handled in modal
      exchangeRate: undefined,
      priceThb: undefined,
      importCost: undefined,
      costThb: costThb ?? 0,
      sellingPrice: sellingPrice ?? 0,
      status,
      shipmentDate: undefined,
      link,
      description,
      quantity,
      variants: variants.map((v, i) => ({
        ...v,
        variantId: v.variantId || Date.now() + i,
        productId: editingProduct?.id || 0,
        // default fallback values in case some are empty
        sku: v.sku ?? "",
        name: v.name ?? "",
        option: v.option ?? "",
        image: v.image ?? "",
        priceThb: typeof v.priceThb === "number" ? v.priceThb : 0,
        costThb: typeof v.costThb === "number" ? v.costThb : 0,
        sellingPrice: typeof v.sellingPrice === "number" ? v.sellingPrice : 0,
        quantity: typeof v.quantity === "number" ? v.quantity : 0,
      })),
    };

    onAddProduct(product);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white border border-purple-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-700">
            {editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>ชื่อสินค้า *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>SKU *</Label>
            <Input value={sku} onChange={e => setSku(e.target.value)} />
          </div>
          <div>
            <Label>หมวดหมู่ *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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
            <Label>ลิงก์สั่งซื้อ</Label>
            <Input value={link} onChange={e => setLink(e.target.value)} />
          </div>
          <div>
            <Label>สถานะ</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="พร้อมส่ง">พร้อมส่ง</SelectItem>
                <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ต้นทุน (฿)</Label>
            <Input
              type="number"
              value={costThb ?? ""}
              onChange={e => setCostThb(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>ราคาขาย (฿)</Label>
            <Input
              type="number"
              value={sellingPrice ?? ""}
              onChange={e => setSellingPrice(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>จำนวนคงเหลือ</Label>
            <Input
              type="number"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>รูปภาพ (URL)</Label>
            <Input value={image} onChange={e => setImage(e.target.value)} />
          </div>
          <div>
            <Label>รายละเอียด</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <Label>ตัวเลือก/แบบ (Variants)</Label>
            <Button variant="outline" size="sm" onClick={handleAddVariant} className="mb-2">
              + เพิ่มตัวเลือก
            </Button>
            {variants.map((variant, idx) => (
              <div key={variant.variantId || idx} className="p-2 mb-2 bg-purple-50 rounded border flex gap-2 items-center">
                <Input
                  placeholder="ชื่อ"
                  value={variant.name}
                  onChange={e => handleVariantChange(idx, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={e => handleVariantChange(idx, "sku", e.target.value)}
                  className="w-28"
                />
                <Input
                  placeholder="ราคา"
                  type="number"
                  value={variant.sellingPrice}
                  onChange={e => handleVariantChange(idx, "sellingPrice", Number(e.target.value))}
                  className="w-20"
                />
                <Input
                  placeholder="ต้นทุน"
                  type="number"
                  value={variant.costThb}
                  onChange={e => handleVariantChange(idx, "costThb", Number(e.target.value))}
                  className="w-20"
                />
                <Input
                  placeholder="จำนวน"
                  type="number"
                  value={variant.quantity}
                  onChange={e => handleVariantChange(idx, "quantity", Number(e.target.value))}
                  className="w-16"
                />
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleRemoveVariant(idx)}>ลบ</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
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
          >
            {editingProduct ? "อัปเดต" : "บันทึก"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
