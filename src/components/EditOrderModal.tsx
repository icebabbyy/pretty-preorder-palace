import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrder as updateOrderInSupabase } from "@/utils/supabase";
import EditOrderItemList from "./EditOrderItemList";
import OrderSummary from "./OrderSummary";
import type { Order, OrderItem } from "@/types";

interface EditOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (order: Order) => void;
  order: Order | null;
}

const EditOrderModal = ({ open, onOpenChange, onUpdateOrder, order }: any) => {
  const [shippingCost, setShippingCost] = useState("0");
  const [deposit, setDeposit] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [status, setStatus] = useState("รอชำระเงิน");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setShippingCost((order.shippingCost ?? order.shipping_cost ?? 0).toString());
      setDeposit((order.deposit ?? 0).toString());
      setDiscount((order.discount ?? 0).toString());
      setStatus(order.status ?? "รอชำระเงิน");
      setUsername(order.username ?? "");
      setAddress(order.address ?? "");
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

  const handleSubmit = async () => {
    if (!order || !username || !address || items.length === 0) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setLoading(true);

    const totalSellingPrice = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalCost = items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
    const shipping = parseFloat(shippingCost) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const depositAmount = parseFloat(deposit) || 0;
    const finalSellingPrice = totalSellingPrice - discountAmount;

    const updatedOrder: Order = {
      ...order,
      items,
      totalSellingPrice: finalSellingPrice,
      totalCost,
      shippingCost: shipping,
      deposit: depositAmount,
      discount: discountAmount,
      profit: finalSellingPrice - totalCost - shipping,
      status,
      username,
      address
    };

    try {
      const result = await updateOrderInSupabase(updatedOrder as any);
      onUpdateOrder({
        ...result,
        totalSellingPrice: result.totalSellingPrice ?? result.total_selling_price ?? 0,
        totalCost: result.totalCost ?? result.total_cost ?? 0,
        shippingCost: result.shippingCost ?? result.shipping_cost ?? 0,
        orderDate: result.orderDate ?? result.order_date ?? '',
      });
      onOpenChange(false);
    } catch (e: any) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่");
      console.error("Update order error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const totalSellingPrice = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const discountAmount = parseFloat(discount) || 0;
  const depositAmount = parseFloat(deposit) || 0;
  const finalSellingPrice = totalSellingPrice - discountAmount;
  const shipping = parseFloat(shippingCost) || 0;
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

          {/* Edit items */}
          <EditOrderItemList
            items={items}
            updateItemQuantity={updateItemQuantity}
            updateItemCost={updateItemCost}
            removeItem={removeItem}
          />

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

          <OrderSummary
            totalSellingPrice={totalSellingPrice}
            discountAmount={discountAmount}
            finalSellingPrice={finalSellingPrice}
            totalCost={totalCost}
            shipping={shipping}
            depositAmount={depositAmount}
            profit={profit}
          />

        </div>
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-purple-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg"
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
            disabled={!username || !address || items.length === 0 || loading}
          >
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderModal;
