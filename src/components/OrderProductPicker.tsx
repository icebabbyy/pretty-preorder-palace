
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

  // Filter only parent products (ไม่รวม options) and ensure they have valid data
  const filteredProducts = products.filter(product => {
    if (!product || !product.id || !product.name) return false;
    
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (product.name || "").toLowerCase().includes(searchLower) ||
      (product.sku || "").toLowerCase().includes(searchLower)
    );
  });

  // Only show products that have valid IDs
  const validProducts = filteredProducts.filter(product => 
    product.id && 
    product.id.toString().trim() !== '' &&
    product.name &&
    product.name.trim() !== ''
  );

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
        {validProducts.length > 0 ? (
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="flex-1 border border-purple-200 rounded-lg">
              <SelectValue placeholder="เลือกสินค้าหลักจากสต็อค" />
            </SelectTrigger>
            <SelectContent>
              {validProducts.map((product, index) => (
                <SelectItem 
                  key={`valid-product-${index}-${product.id}`} 
                  value={product.id.toString()}
                >
                  {product.name} - ฿{product.sellingPrice?.toLocaleString() || 0} ({product.sku || product.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-gray-500 p-2 border border-purple-200 rounded-lg">
            {searchTerm ? "ไม่พบสินค้าที่ค้นหา" : "ไม่มีสินค้าในระบบ"}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProductPicker;
