
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderItem } from "@/types";

interface OrderItemCardProps {
  item: OrderItem;
  updateItemQuantity: (productId: number, quantity: number) => void;
  updateItemCost: (productId: number, unitCost: number) => void;
  removeItem: (productId: number) => void;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({
  item,
  updateItemQuantity,
  updateItemCost,
  removeItem
}) => (
  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
    <div className="flex items-center gap-3 mb-3">
      <img
        src={item.productImage}
        alt={item.productName}
        className="w-12 h-12 rounded object-cover border border-purple-200"
      />
      <div className="flex-1">
        <p className="font-medium">{item.productName}</p>
        <p className="text-sm text-purple-600">{item.sku}</p>
        <p className="text-sm font-medium text-green-600">฿{item.unitPrice.toLocaleString()}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeItem(item.productId)}
        className="text-red-600 hover:bg-red-50"
      >
        ลบ
      </Button>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label>จำนวน</Label>
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
          className="border border-purple-200 rounded-lg"
        />
      </div>
      <div>
        <Label>ต้นทุนต่อชิ้น (฿)</Label>
        <Input
          type="number"
          value={item.unitCost}
          onChange={(e) => updateItemCost(item.productId, parseFloat(e.target.value) || 0)}
          className="border border-purple-200 rounded-lg"
        />
      </div>
    </div>
  </div>
);

export default OrderItemCard;
