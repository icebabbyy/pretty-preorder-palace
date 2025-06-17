import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addOrder } from "@/utils/orders";
import { Product, Order, OrderItem } from "@/types";
import OrderProductPicker from "./OrderProductPicker";
import OrderItemList from "./OrderItemList";
import OrderSummary from "./OrderSummary";

interface AddOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOrder: (order: Order) => void;
  products: Product[];
}

const AddOrderModal = ({ open, onOpenChange, onAddOrder, products }: AddOrderModalProps) => {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState("0");
  const [deposit, setDeposit] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [status, setStatus] = useState("รอชำระเงิน");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentSlip, setPaymentSlip] = useState("");
  const [loading, setLoading] = useState(false);

  const addProductToOrder = () => {
    if (!selectedProductId || selectedProductId === "no-results") return;
    
    const product = products.find(p => String(p.id) === selectedProductId);
    if (!product) return;

    const existingItem = orderItems.find(item => item.productId === product.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        productId: product.id!,
        productName: product.name,
        productImage: product.image,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.sellingPrice,
        unitCost: product.costThb
      };
      setOrderItems([...orderItems, newItem]);
    }
    setSelectedProductId("");
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    setOrderItems(orderItems.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const updateItemCost = (productId: number, unitCost: number) => {
    setOrderItems(orderItems.map(item =>
      item.productId === productId ? { ...item, unitCost } : item
    ));
  };

  const removeItem = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const handleSubmit = async () => {
    if (!username || !address || orderItems.length === 0) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setLoading(true);

    const totalSellingPrice = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalCost = orderItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
    const shipping = parseFloat(shippingCost) || 0;
    const depositAmount = parseFloat(deposit) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const finalSellingPrice = totalSellingPrice - discountAmount;

    const newOrder = {
      items: orderItems,
      totalSellingPrice: finalSellingPrice,
      totalCost,
      shippingCost: shipping,
      deposit: depositAmount,
      discount: discountAmount,
      profit: finalSellingPrice - totalCost - shipping,
      status,
      orderDate: new Date().toISOString(), // แก้ไข: ใช้ ISO string แทน
      paymentDate: paymentDate || null,
      paymentSlip: paymentSlip || null,
      username,
      address
    };

    try {
      console.log('Submitting order:', newOrder);
      const createdOrder = await addOrder(newOrder as any);
      console.log('Order created:', createdOrder);
      onAddOrder({
        ...createdOrder,
        totalSellingPrice: createdOrder.totalSellingPrice ?? 0,
        totalCost: createdOrder.totalCost ?? 0,
        shippingCost: createdOrder.shippingCost ?? 0,
        orderDate: createdOrder.orderDate ?? '',
      });
      onOpenChange(false);
      // Reset form
      setOrderItems([]);
      setSelectedProductId("");
      setShippingCost("0");
      setDeposit("0");
      setDiscount("0");
      setStatus("รอชำระเงิน");
      setUsername("");
      setAddress("");
      setPaymentDate("");
      setPaymentSlip("");
    } catch (e) {
      console.error("Add order error:", e);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const totalSellingPrice = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalCost = orderItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const discountAmount = parseFloat(discount || "0");
  const finalSellingPrice = totalSellingPrice - discountAmount;
  const shipping = parseFloat(shippingCost || "0");
  const depositAmount = parseFloat(deposit || "0");
  const profit = finalSellingPrice - totalCost - shipping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-700">+ เพิ่มออเดอร์ใหม่</DialogTitle>
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentDate">วันที่ชำระเงิน</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="border border-purple-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="paymentSlip">URL สลิปโอนเงิน</Label>
              <Input
                id="paymentSlip"
                value={paymentSlip}
                onChange={(e) => setPaymentSlip(e.target.value)}
                placeholder="https://..."
                className="border border-purple-200 rounded-lg"
              />
            </div>
          </div>

          <OrderProductPicker
            products={products}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            addProductToOrder={addProductToOrder}
          />
          
          {orderItems.length > 0 && (
            <OrderItemList
              items={orderItems}
              updateItemQuantity={updateItemQuantity}
              updateItemCost={updateItemCost}
              removeItem={removeItem}
            />
          )}
          
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
          
          {orderItems.length > 0 && (
            <OrderSummary
              totalSellingPrice={totalSellingPrice}
              discountAmount={discountAmount}
              finalSellingPrice={finalSellingPrice}
              totalCost={totalCost}
              shipping={shipping}
              depositAmount={depositAmount}
              profit={profit}
            />
          )}
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
            disabled={!username || !address || orderItems.length === 0 || loading}
          >
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrderModal;
