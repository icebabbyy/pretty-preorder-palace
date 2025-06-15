
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order {
  id: number;
  product: string;
  productImage: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  cost: number;
  shippingCost: number;
  deposit: number;
  discount: number;
  profit: number;
  status: string;
  orderDate: string;
  username: string;
  address: string;
}

interface EditOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (order: Order) => void;
  order: Order | null;
}

const EditOrderModal = ({ open, onOpenChange, onUpdateOrder, order }: EditOrderModalProps) => {
  const [quantity, setQuantity] = useState("1");
  const [cost, setCost] = useState("0");
  const [shippingCost, setShippingCost] = useState("0");
  const [deposit, setDeposit] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [status, setStatus] = useState("รอชำระเงิน");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (order) {
      setQuantity(order.quantity.toString());
      setCost(order.cost.toString());
      setShippingCost(order.shippingCost.toString());
      setDeposit(order.deposit.toString());
      setDiscount(order.discount.toString());
      setStatus(order.status);
      setUsername(order.username);
      setAddress(order.address);
    }
  }, [order]);

  const handleSubmit = () => {
    if (!order || !username || !address) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const totalCost = parseFloat(cost) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const originalSellingPrice = order.sellingPrice / order.quantity; // Get unit price
    const totalSellingPrice = originalSellingPrice * parseInt(quantity);
    const finalSellingPrice = totalSellingPrice - discountAmount;

    const updatedOrder: Order = {
      ...order,
      quantity: parseInt(quantity),
      sellingPrice: finalSellingPrice,
      cost: totalCost,
      shippingCost: shipping,
      deposit: parseFloat(deposit) || 0,
      discount: discountAmount,
      profit: finalSellingPrice - totalCost - shipping,
      status,
      username,
      address
    };

    onUpdateOrder(updatedOrder);
    onOpenChange(false);
  };

  if (!order) return null;

  const originalSellingPrice = order.sellingPrice / order.quantity;
  const totalSellingPrice = originalSellingPrice * parseInt(quantity);
  const discountAmount = parseFloat(discount) || 0;
  const finalSellingPrice = totalSellingPrice - discountAmount;
  const totalCost = parseFloat(cost) || 0;
  const shipping = parseFloat(shippingCost) || 0;
  const depositAmount = parseFloat(deposit) || 0;
  const profit = finalSellingPrice - totalCost - shipping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-700">✏️ แก้ไขออเดอร์</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input 
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้"
              className="border border-purple-200 rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="address">ที่อยู่ *</Label>
            <Input 
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ที่อยู่จัดส่ง"
              className="border border-purple-200 rounded-lg"
            />
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <img 
                src={order.productImage} 
                alt={order.product}
                className="w-12 h-12 rounded object-cover border border-purple-200"
              />
              <div>
                <p className="font-medium">{order.product}</p>
                <p className="text-sm text-purple-600">{order.sku}</p>
                <p className="text-sm font-medium text-green-600">฿{originalSellingPrice.toLocaleString()} ต่อชิ้น</p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">จำนวน</Label>
            <Input 
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="border border-purple-200 rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="cost">ต้นทุนรวม (฿)</Label>
            <Input 
              id="cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0"
              className="border border-purple-200 rounded-lg"
            />
          </div>

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

          <div>
            <Label htmlFor="status">สถานะ</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border border-purple-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="รอชำระเงิน">รอชำระเงิน</SelectItem>
                <SelectItem value="รอโรงงานจัดส่ง">รอโรงงานจัดส่ง</SelectItem>
                <SelectItem value="กำลังมาไทย">กำลังมาไทย</SelectItem>
                <SelectItem value="จัดส่งแล้ว">จัดส่งแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-700 mb-2">สรุปออเดอร์</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>ราคาขายรวม:</span>
                <span className="font-medium text-green-600">
                  ฿{totalSellingPrice.toLocaleString()}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>ส่วนลด:</span>
                  <span className="font-medium text-red-600">
                    -฿{discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ราคาขายสุทธิ:</span>
                <span className="font-medium text-green-600">
                  ฿{finalSellingPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ต้นทุนรวม:</span>
                <span className="font-medium text-red-600">
                  ฿{totalCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง:</span>
                <span className="font-medium text-orange-600">
                  ฿{shipping.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>มัดจำ:</span>
                <span className="font-medium text-blue-600">
                  ฿{depositAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="font-medium">กำไรรวม:</span>
                <span className={`font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ฿{profit.toLocaleString()}
                </span>
              </div>
              {depositAmount > 0 && (
                <div className="bg-yellow-50 p-2 rounded mt-2 border border-yellow-200">
                  <p className="text-xs text-yellow-700">
                    💡 ยอดที่เหลือ: ฿{(finalSellingPrice - depositAmount).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-purple-200">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
            disabled={!username || !address}
          >
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderModal;
