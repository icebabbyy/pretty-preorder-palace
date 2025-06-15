
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";

interface OrderProductPickerProps {
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  addProductToOrder: () => void;
}

const OrderProductPicker: React.FC<OrderProductPickerProps> = ({
  products,
  selectedProductId,
  setSelectedProductId,
  addProductToOrder
}) => (
  <div>
    <Label htmlFor="product">เพิ่มสินค้า</Label>
    <div className="flex gap-2">
      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
        <SelectTrigger className="flex-1 border border-purple-200 rounded-lg">
          <SelectValue placeholder="เลือกสินค้าจากสต็อค" />
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id.toString()}>
              {product.name} - ฿{product.sellingPrice.toLocaleString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={addProductToOrder}
        disabled={!selectedProductId}
        className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
      >
        เพิ่ม
      </Button>
    </div>
  </div>
);

export default OrderProductPicker;
