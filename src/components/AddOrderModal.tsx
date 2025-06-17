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
  const [selectedOptionId, setSelectedOptionId] = useState("");
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

  const selectedProduct = products.find(p => String(p.id) === selectedProductId);
  const options = selectedProduct?.options || [];
  const canAddParent = selectedProduct && (selectedProduct.sellingPrice ?? 0) > 0;

  const addProductToOrder = (type: "parent" | "option") => {
    if (!selectedProduct) return;

    let displayName = selectedProduct.name;
    let productImage = selectedProduct.image;
    let sku = selectedProduct.sku;
    let unitPrice = selectedProduct.sellingPrice;
    let unitCost = selectedProduct.costThb;

    if (type === "option" && selectedOptionId) {
      const opt = options.find(o => o.id === selectedOptionId);
      if (!opt) return;
      displayName = `${selectedProduct.name} (${opt.name})`;
      productImage = opt.image || selectedProduct.image;
      sku = opt.id;
      unitPrice = opt.sellingPrice;
      unitCost = opt.costThb;
    }

    const existingItem = orderItems.find(
      item => item.productId === selectedProduct.id && item.sku === sku
    );
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === selectedProduct.id && item.sku === sku
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        productId: selectedProduct.id!,
        productName: displayName,
        productImage,
        sku,
        quantity: 1,
        unitPrice,
        unitCost,
      };
      setOrderItems([...orderItems, newItem]);
    }
    setSelectedOptionId("");
    if (type === "parent") setSelectedProductId("");
  };

  const updateItemQuantity = (productId: number, quantity: number, sku?: string) => {
    setOrderItems(orderItems.map(item =>
      item.productId === productId && (!sku || item.sku === sku)
        ? { ...item, quantity }
        : item
    ));
  };

  const updateItemCost = (productId: number, unitCost: number, sku?: string) => {
    setOrderItems(orderItems.map(item =>
      item.productId === productId && (!sku || item.sku === sku)
        ? { ...item, unitCost }
        : item
    ));
  };

  const removeItem = (productId: number, sku?: string) => {
    setOrderItems(orderItems.filter(item =>
      !(item.productId === productId && (!sku || item.sku === sku))
    ));
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
      orderDate: new Date().toISOString(),
      paymentDate: paymentDate || null,
      paymentSlip: paymentSlip || null,
      username,
      address,
    };

    try {
      const createdOrder = await addOrder(newOrder as any);
      onAddOrder({
        ...createdOrder,
        totalSellingPrice: createdOrder.totalSellingPrice ?? 0,
        totalCost: createdOrder.totalCost ?? 0,
        shippingCost: createdOrder.shippingCost ?? 0,
        orderDate: createdOrder.orderDate ?? '',
      });
      onOpenChange(false);
      setOrderItems([]);
      setSelectedProductId("");
      setSelectedOptionId("");
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
              {paymentSlip && (paymentSlip.startsWith("http://") || paymentSlip.startsWith("https://")) && (
                <div className="mt-2">
                  <a href={paymentSlip} target="_blank" rel="noopener noreferrer">
                    <img
                      src={paymentSlip}
                      alt="สลิปโอนเงิน"
                      className="w-32 h-32 object-cover border rounded"
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
          <div>
            <OrderProductPicker
              products={products}
              selectedProductId={selectedProductId}
              setSelectedProductId={id => {
                setSelectedProductId(id);
                setSelectedOptionId("");
              }}
            />
            {selectedProduct && (
              <div className="mt-2 space-y-2">
                {/* ถ้ามี option ให้เลือก option ได้ + ปุ่มเพิ่มตัวเลือก */}
                {options.length > 0 && (
                  <div>
                    <Label>เลือกตัวเลือกสินค้า</Label>
                    <Select value={selectedOptionId} onValueChange={setSelectedOptionId}>
                      <SelectTrigger className="border border-purple-200 rounded-lg w-64">
                        <SelectValue placeholder="เลือกตัวเลือก" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map(opt => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.name} - ฿{opt.sellingPrice?.toLocaleString() || 0} ({opt.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className="mt-2"
                      onClick={() => addProductToOrder("option")}
                      disabled={!selectedOptionId}
                    >
                      เพิ่มตัวเลือกนี้
                    </Button>
                  </div>
                )}
                {/* ถ้าสินค้าแม่ขายได้เอง เพิ่มปุ่มได้ */}
                {canAddParent && (
                  <Button
                    className="mt-2"
                    onClick={() => addProductToOrder("parent")}
                  >
                    เพิ่มสินค้าหลัก
                  </Button>
                )}
              </div>
            )}
          </div>
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
