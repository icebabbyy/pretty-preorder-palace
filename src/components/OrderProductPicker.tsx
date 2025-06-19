
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
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                // Ensure we have a non-empty value - triple validation
                let productValue = "";
                
                if (product.id && product.id.toString().trim() !== '') {
                  productValue = product.id.toString().trim();
                } else if (product.sku && typeof product.sku === 'string' && product.sku.trim() !== '') {
                  productValue = `product-sku-${product.sku.trim()}-${index}`;
                } else if (product.name && typeof product.name === 'string' && product.name.trim() !== '') {
                  productValue = `product-name-${product.name.trim()}-${index}`;
                } else {
                  productValue = `fallback-product-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                }
                
                console.log('Product Picker - Product value generated:', productValue, 'for product:', product);
                
                // Additional safety check before rendering
                if (!productValue || productValue.trim() === '') {
                  console.error('Empty product value detected, skipping product:', product);
                  return null;
                }
                
                return (
                  <SelectItem 
                    key={`product-picker-${index}-${productValue}`} 
                    value={productValue}
                  >
                    {product.name} - ฿{product.sellingPrice?.toLocaleString() || 0} ({product.sku || productValue})
                  </SelectItem>
                );
              }).filter(Boolean)
            ) : (
              <SelectItem value="no-results-found-placeholder-unique" disabled>
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
