import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";

interface OrderProductPickerProps {
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
}

const OrderProductPicker: React.FC<OrderProductPickerProps> = ({
  products,
  selectedProductId,
  setSelectedProductId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // flattened list: show both parent (ถ้ามีราคา) และ options
  const productOptions = products.flatMap(product => {
    const parentSelectable = (product.sellingPrice ?? 0) > 0;
    const parent = parentSelectable
      ? [{
        id: `${product.id}`,
        label: `${product.name} - ฿${product.sellingPrice?.toLocaleString() || 0} (${product.sku})`
      }]
      : [];
    const options = (product.options || []).map(opt => ({
      id: `${product.id}__${opt.id}`, // composite key
      label: `${product.name} (${opt.name}) - ฿${opt.sellingPrice?.toLocaleString() || 0} (${opt.id})`
    }));
    return [...parent, ...options];
  });

  const filtered = productOptions.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Label htmlFor="product">เพิ่มสินค้า</Label>
      <div className="space-y-2">
        <Input
          placeholder="ค้นหาสินค้า (ชื่อหรือ SKU หรือ option)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-purple-200 rounded-lg"
        />
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="flex-1 border border-purple-200 rounded-lg">
            <SelectValue placeholder="เลือกสินค้าจากสต็อค" />
          </SelectTrigger>
          <SelectContent>
            {filtered.map(opt => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
            {filtered.length === 0 && (
              <SelectItem value="no-results" disabled>
                ไม่พบสินค้าที่ค้นหา
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
export default OrderProductPicker;
