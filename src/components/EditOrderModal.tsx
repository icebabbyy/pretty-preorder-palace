import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, OrderItem } from "@/types/inventory";

interface EditOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (order: Order) => void;
  order: Order | null;
}

const EditOrderModal = ({ open, onOpenChange, onUpdateOrder, order }: EditOrderModalProps) => {
  const [shippingCost, setShippingCost] = useState("0");
  const [deposit, setDeposit] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [status, setStatus] = useState("รอชำระเงิน");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setShippingCost(order.shippingCost.toString());
      setDeposit(order.deposit.toString());
      setDiscount(order.discount.toString());
      setStatus(order.status);
      setUsername(order.username);
      setAddress(order.address);
    }
  }, [order]);

  const updateItemQuantity = (index: number, quantity: number) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const updateItemCost = (index: number, unitCost: number) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, unitCost } : item
    ));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!order || !username || !address || items.length === 0) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const totalSellingPrice = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalCost = items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
    const shipping = parseFloat(shippingCost) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const finalSellingPrice = totalSellingPrice - discountAmount;

    const updatedOrder: Order = {
      ...order,
      items,
      totalSellingPrice: finalSellingPrice,
      totalCost,
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

  const totalSellingPrice = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const discountAmount = parseFloat(discount) || 0;
  const finalSellingPrice = totalSellingPrice - discountAmount;
  const shipping = parseFloat(shippingCost) || 0;
  const depositAmount = parseFloat(deposit) || 0;
  const profit = finalSellingPrice - totalCost - shipping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
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

          <div>
            <Label>รายการสินค้า</Label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
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
                      onClick={() => removeItem(index)}
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
                        onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                        className="border border-purple-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <Label>ต้นทุนต่อชิ้น (฿)</Label>
                      <Input
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => updateItemCost(index, parseFloat(e.target.value) || 0)}
                        className="border border-purple-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            disabled={!username || !address || items.length === 0}
          >
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderModal;
