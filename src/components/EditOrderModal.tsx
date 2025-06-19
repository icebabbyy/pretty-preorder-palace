
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateOrder } from "@/utils/orders";
import EditOrderItemList from "./EditOrderItemList";
import OrderSummary from "./OrderSummary";
import EditOrderForm from "./edit-order/EditOrderForm";
import EditOrderPricing from "./edit-order/EditOrderPricing";
import EditOrderOptionSelector from "./edit-order/EditOrderOptionSelector";
import type { Order, OrderItem, Product } from "@/types";

interface EditOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (order: Order) => void;
  order: Order | null;
  products?: Product[];
}

const EditOrderModal = ({ open, onOpenChange, onUpdateOrder, order, products = [] }: EditOrderModalProps) => {
  const [shippingCost, setShippingCost] = useState("0");
  const [deposit, setDeposit] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [status, setStatus] = useState("รอชำระเงิน");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentSlip, setPaymentSlip] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  // สำหรับแก้ไข option ของสินค้า
  const [selectedEditIdx, setSelectedEditIdx] = useState<number | null>(null);
  const [selectedEditOptionId, setSelectedEditOptionId] = useState<string>("");

  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setShippingCost((order.shippingCost ?? 0).toString());
      setDeposit((order.deposit ?? 0).toString());
      setDiscount((order.discount ?? 0).toString());
      setStatus(order.status ?? "รอชำระเงิน");
      setUsername(order.username ?? "");
      setAddress(order.address ?? "");
      setPaymentDate(order.paymentDate ?? "");
      setPaymentSlip(order.paymentSlip ?? "");
    }
  }, [order]);

  const confirmEditOption = () => {
    if (selectedEditIdx == null || !selectedEditOptionId) return;
    const item = items[selectedEditIdx];
    const product = products.find(p => p.id === item.productId);
    const option = product?.options?.find(o => o.id === selectedEditOptionId);
    if (option) {
      const updatedItem = {
        ...item,
        productName: `${product?.name} (${option.name})`,
        productImage: option.image || product?.image,
        sku: option.id,
        unitPrice: option.sellingPrice,
        unitCost: option.costThb,
      };
      setItems(items.map((it, idx) => idx === selectedEditIdx ? updatedItem : it));
    }
    setSelectedEditIdx(null);
    setSelectedEditOptionId("");
  };

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
      paymentDate: paymentDate || null,
      paymentSlip: paymentSlip || null,
      username,
      address,
    };

    try {
      const result = await updateOrder(updatedOrder);
      onUpdateOrder({
        ...result,
        totalSellingPrice: result.totalSellingPrice ?? 0,
        totalCost: result.totalCost ?? 0,
        shippingCost: result.shippingCost ?? 0,
        orderDate: result.orderDate ?? '',
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
          <EditOrderForm
            order={order}
            username={username}
            setUsername={setUsername}
            address={address}
            setAddress={setAddress}
            paymentDate={paymentDate}
            setPaymentDate={setPaymentDate}
            paymentSlip={paymentSlip}
            setPaymentSlip={setPaymentSlip}
            status={status}
            setStatus={setStatus}
          />
          
          <EditOrderItemList
            items={items}
            updateItemQuantity={updateItemQuantity}
            updateItemCost={updateItemCost}
            removeItem={removeItem}
          />
          
          <EditOrderOptionSelector
            selectedEditIdx={selectedEditIdx}
            selectedEditOptionId={selectedEditOptionId}
            setSelectedEditOptionId={setSelectedEditOptionId}
            products={products}
            items={items}
            onConfirmEdit={confirmEditOption}
            onCancel={() => setSelectedEditIdx(null)}
          />
          
          <EditOrderPricing
            shippingCost={shippingCost}
            setShippingCost={setShippingCost}
            discount={discount}
            setDiscount={setDiscount}
            deposit={deposit}
            setDeposit={setDeposit}
          />
          
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
