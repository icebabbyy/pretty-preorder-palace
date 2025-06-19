
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditOrderPricingProps {
  shippingCost: string;
  setShippingCost: (value: string) => void;
  discount: string;
  setDiscount: (value: string) => void;
  deposit: string;
  setDeposit: (value: string) => void;
}

const EditOrderPricing: React.FC<EditOrderPricingProps> = ({
  shippingCost,
  setShippingCost,
  discount,
  setDiscount,
  deposit,
  setDeposit,
}) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="shippingCost">ค่าจัดส่ง (฿)</Label>
      <Input
        id="shippingCost"
        type="number"
        value={shippingCost}
        onChange={(e) => setShippingCost(e.target.value)}
        placeholder="0"
        className="border border-purple-200 rounded-lg"
      />
    </div>
    <div>
      <Label htmlFor="discount">ส่วนลด (฿)</Label>
      <Input
        id="discount"
        type="number"
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
        placeholder="0"
        className="border border-purple-200 rounded-lg"
      />
    </div>
    <div>
      <Label htmlFor="deposit">มัดจำ (฿)</Label>
      <Input
        id="deposit"
        type="number"
        value={deposit}
        onChange={(e) => setDeposit(e.target.value)}
        placeholder="0"
        className="border border-purple-200 rounded-lg"
      />
    </div>
  </div>
);

export default EditOrderPricing;
