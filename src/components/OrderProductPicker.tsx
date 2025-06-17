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

  // Filter only parent products (ไม่รวม options)
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (product.name || "").toLowerCase().includes(searchLower) ||
      (product.sku || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <Label htmlFor="product">เพิ่มสินค้า</Label>
      <div className="space-y-2">
        <Input
          placeholder="ค้นหาสินค้า (ชื่อหรือ SKU)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-purple-200 rounded-lg"
        />
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="flex-1 border border-purple-200 rounded-lg">
            <SelectValue placeholder="เลือกสินค้าหลักจากสต็อค" />
          </SelectTrigger>
          <SelectContent>
            {filteredProducts.map(product => (
              <SelectItem key={product.id} value={product.id?.toString() || ""}>
                {product.name} - ฿{product.sellingPrice?.toLocaleString() || 0} ({product.sku})
              </SelectItem>
            ))}
            {filteredProducts.length === 0 && (
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
