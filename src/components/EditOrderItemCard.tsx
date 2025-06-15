
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OrderItem } from "@/types";

interface EditOrderItemCardProps {
  item: OrderItem;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateUnitCost: (unitCost: number) => void;
  onRemove: () => void;
}

const EditOrderItemCard: React.FC<EditOrderItemCardProps> = ({
  item,
  onUpdateQuantity,
  onUpdateUnitCost,
  onRemove
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
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
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
          onChange={(e) => onUpdateQuantity(parseInt(e.target.value) || 1)}
          className="border border-purple-200 rounded-lg"
        />
      </div>
      <div>
        <Label>ต้นทุนต่อชิ้น (฿)</Label>
        <Input
          type="number"
          value={item.unitCost}
          onChange={(e) => onUpdateUnitCost(parseFloat(e.target.value) || 0)}
          className="border border-purple-200 rounded-lg"
        />
      </div>
    </div>
  </div>
);

export default EditOrderItemCard;
