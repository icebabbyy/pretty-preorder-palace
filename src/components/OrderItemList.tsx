
import { OrderItem } from "@/types";
import OrderItemCard from "./OrderItemCard";
import { Label } from "@/components/ui/label";

interface OrderItemListProps {
  items: OrderItem[];
  updateItemQuantity: (productId: number, quantity: number) => void;
  updateItemCost: (productId: number, unitCost: number) => void;
  removeItem: (productId: number) => void;
}

const OrderItemList: React.FC<OrderItemListProps> = ({
  items,
  updateItemQuantity,
  updateItemCost,
  removeItem
}) => (
  <div>
    <Label>รายการสินค้า</Label>
    <div className="space-y-3">
      {items.map((item) => (
        <OrderItemCard
          key={item.productId}
          item={item}
          updateItemQuantity={updateItemQuantity}
          updateItemCost={updateItemCost}
          removeItem={removeItem}
        />
      ))}
    </div>
  </div>
);

export default OrderItemList;
