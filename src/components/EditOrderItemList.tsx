
import { Label } from "@/components/ui/label";
import { OrderItem } from "@/types";
import EditOrderItemCard from "./EditOrderItemCard";

interface EditOrderItemListProps {
  items: OrderItem[];
  updateItemQuantity: (index: number, quantity: number) => void;
  updateItemCost: (index: number, unitCost: number) => void;
  removeItem: (index: number) => void;
}

const EditOrderItemList: React.FC<EditOrderItemListProps> = ({
  items,
  updateItemQuantity,
  updateItemCost,
  removeItem
}) => (
  <div>
    <Label>รายการสินค้า</Label>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <EditOrderItemCard
          key={item.productId}
          item={item}
          onUpdateQuantity={(quantity) => updateItemQuantity(idx, quantity)}
          onUpdateUnitCost={(unitCost) => updateItemCost(idx, unitCost)}
          onRemove={() => removeItem(idx)}
        />
      ))}
    </div>
  </div>
);

export default EditOrderItemList;
