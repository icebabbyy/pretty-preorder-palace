import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductVariant {
  variantId: number;
  productId: number;
  sku: string;
  name: string;
  option: string;
  image: string;
  costThb: number;
  sellingPrice: number;
  quantity: number;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  image: string;
  costThb: number;
  sellingPrice: number;
  variants?: ProductVariant[];
}

interface OrderItem {
  productId: number;
  variantId: number;
  productName: string;
  variantName: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

interface Order {
  items: OrderItem[];
  totalSellingPrice: number;
  totalCost: number;
  shippingCost: number;
  deposit: number;
  discount: number;
  profit: number;
  status: string;
  orderDate: string;
  username: string;
  address: string;
}

interface AddOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOrder: (order: Order) => void;
  products: Product[];
}

const AddOrderModal = ({
  open,
  onOpenChange,
  onAddOrder,
  products,
}: AddOrderModalProps) => {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState("0");
  const [deposit, setDeposit] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [status, setStatus] = useState("รอชำระเงิน");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");

  // ถ้าไม่มี products เลย ไม่ต้อง render modal (กันหน้า crash)
  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  // หาสินค้าที่ถูกเลือก
  const selectedProduct = products.find(
    (p) => p.id.toString() === selectedProductId
  );

  // สร้างตัวเลือก variant: ตัวหลักเป็นอันแรกเสมอ
  let variantOptions: ProductVariant[] = [];
  if (selectedProduct) {
    const mainVariant: ProductVariant = {
      variantId: 0,
      productId: selectedProduct.id,
      sku: selectedProduct.sku ?? "",
      name: selectedProduct.name,
      option: "",
      image: selectedProduct.image ?? "",
      costThb:
        typeof selectedProduct.costThb === "number"
          ? selectedProduct.costThb
          : 0,
      sellingPrice:
        typeof selectedProduct.sellingPrice === "number"
          ? selectedProduct.sellingPrice
          : 0,
      quantity: 0,
    };

    const variants: ProductVariant[] = Array.isArray(selectedProduct.variants)
      ? selectedProduct.variants
      : [];

    variantOptions = [mainVariant, ...variants];
  }

  const selectedVariant = variantOptions.find(
    (v) => v.variantId.toString() === selectedVariantId
  );

  // เพิ่มสินค้าเข้า order
  const addProductToOrder = () => {
    if (!selectedProduct || !selectedVariant) return;

    const existingItem = orderItems.find(
      (item) =>
        item.productId === selectedProduct.id &&
        item.variantId === selectedVariant.variantId
    );

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === selectedProduct.id &&
          item.variantId === selectedVariant.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: OrderItem = {
        productId: selectedProduct.id,
        variantId: selectedVariant.variantId,
        productName: selectedProduct.name,
        variantName:
          selectedVariant.variantId === 0
            ? "ตัวเลือกหลัก"
            : selectedVariant.name +
              (selectedVariant.option ? ` (${selectedVariant.option})` : ""),
        productImage: selectedVariant.image || selectedProduct.image,
        sku: selectedVariant.sku,
        quantity: 1,
        unitPrice: selectedVariant.sellingPrice,
        unitCost: selectedVariant.costThb,
      };
      setOrderItems([...orderItems, newItem]);
    }
    setSelectedProductId("");
    setSelectedVariantId("");
  };

  const updateItemQuantity = (
    productId: number,
    variantId: number,
    quantity: number
  ) => {
    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateItemCost = (
    productId: number,
    variantId: number,
    unitCost: number
  ) => {
    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, unitCost }
          : item
      )
    );
  };

  const removeItem = (productId: number, variantId: number) => {
    setOrderItems(
      orderItems.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const handleSubmit = () => {
    if (!username || !address || orderItems.length === 0) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const totalSellingPrice = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const totalCost = orderItems.reduce(
      (sum, item) => sum + item.unitCost * item.quantity,
      0
    );
    const shipping = parseFloat(shippingCost) || 0;
    const depositAmount = parseFloat(deposit) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const finalSellingPrice = totalSellingPrice - discountAmount;

    const newOrder: Order = {
      items: orderItems,
      totalSellingPrice: finalSellingPrice,
      totalCost,
      shippingCost: shipping,
      deposit: depositAmount,
      discount: discountAmount,
      profit: finalSellingPrice - totalCost - shipping,
      status,
      orderDate: new Date().toLocaleDateString("th-TH"),
      username,
      address,
    };

    onAddOrder(newOrder);
    onOpenChange(false);

    setOrderItems([]);
    setSelectedProductId("");
    setSelectedVariantId("");
    setShippingCost("0");
    setDeposit("0");
    setDiscount("0");
    setStatus("รอชำระเงิน");
    setUsername("");
    setAddress("");
  };

  const totalSellingPrice = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalCost = orderItems.reduce(
    (sum, item) => sum + item.unitCost * item.quantity,
    0
  );
  const discountAmount = parseFloat(discount || "0");
  const finalSellingPrice = totalSellingPrice - discountAmount;
  const shipping = parseFloat(shippingCost || "0");
  const depositAmount = parseFloat(deposit || "0");
  const profit = finalSellingPrice - totalCost - shipping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-700">
            + เพิ่มออเดอร์ใหม่
          </DialogTitle>
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
            <Label htmlFor="product">เพิ่มสินค้า</Label>
            <div className="flex gap-2">
              {/* เลือกสินค้า */}
              <Select
                value={selectedProductId}
                onValueChange={(val) => {
                  setSelectedProductId(val);
                  setSelectedVariantId("");
                }}
              >
                <SelectTrigger className="flex-1 border border-purple-200 rounded-lg">
                  <SelectValue placeholder="เลือกสินค้าจากสต็อค" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* เลือกตัวเลือกย่อย */}
              <Select
                value={selectedVariantId}
                onValueChange={setSelectedVariantId}
                disabled={!selectedProduct}
              >
                <SelectTrigger className="flex-1 border border-purple-200 rounded-lg">
                  <SelectValue
                    placeholder={
                      selectedProduct
                        ? "เลือกตัวเลือก/แบบ"
                        : "เลือกสินค้าก่อน"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {variantOptions.map((variant) => (
                    <SelectItem
                      key={variant.variantId}
                      value={variant.variantId.toString()}
                    >
                      {variant.variantId === 0
                        ? "ตัวเลือกหลัก"
                        : variant.name +
                          (variant.option
                            ? ` (${variant.option})`
                            : "")}
                      {" - ฿"}
                      {variant.sellingPrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={addProductToOrder}
                disabled={!selectedProductId || !selectedVariantId}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                เพิ่ม
              </Button>
            </div>
          </div>

          {orderItems.length > 0 && (
            <div>
              <Label>รายการสินค้า</Label>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 rounded object-cover border border-purple-200"
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.productName}
                          {item.variantName ? (
                            <span className="text-xs text-purple-700">
                              {" "}
                              ({item.variantName})
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm text-purple-600">{item.sku}</p>
                        <p className="text-sm font-medium text-green-600">
                          ฿{item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
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
                          onChange={(e) =>
                            updateItemQuantity(
                              item.productId,
                              item.variantId,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="border border-purple-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label>ต้นทุนต่อชิ้น (฿)</Label>
                        <Input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) =>
                            updateItemCost(
                              item.productId,
                              item.variantId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="border border-purple-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                  <SelectItem value="รอโรงงานจัดส่ง">
                    รอโรงงานจัดส่ง
                  </SelectItem>
                  <SelectItem value="กำลังมาไทย">กำลังมาไทย</SelectItem>
                  <SelectItem value="จัดส่งแล้ว">จัดส่งแล้ว</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {orderItems.length > 0 && (
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
                  <span
                    className={`font-bold ${
                      profit >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    ฿{profit.toLocaleString()}
                  </span>
                </div>
                {depositAmount > 0 && (
                  <div className="bg-yellow-50 p-2 rounded mt-2 border border-yellow-200">
                    <p className="text-xs text-yellow-700">
                      💡 ยอดที่เหลือ: ฿
                      {(finalSellingPrice - depositAmount).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
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
            disabled={!username || !address || orderItems.length === 0}
          >
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrderModal;
