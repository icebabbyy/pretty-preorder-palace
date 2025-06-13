
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: number;
  sku: string;
  name: string;
  sellingPrice: number;
  costThb: number;
  image: string;
}

interface Order {
  product: string;
  productImage: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  cost: number;
  profit: number;
  status: string;
  orderDate: string;
}

interface AddOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOrder: (order: Order) => void;
  products: Product[];
}

const AddOrderModal = ({ open, onOpenChange, onAddOrder, products }: AddOrderModalProps) => {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customCost, setCustomCost] = useState("");
  const [status, setStatus] = useState("รอชำระเงิน");

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

  const handleSubmit = () => {
    if (!selectedProduct || !quantity) {
      alert("กรุณาเลือกสินค้าและระบุจำนวน");
      return;
    }

    const cost = customCost ? parseFloat(customCost) : selectedProduct.costThb;
    const totalSellingPrice = selectedProduct.sellingPrice * parseInt(quantity);
    const totalCost = cost * parseInt(quantity);

    const newOrder: Order = {
      product: selectedProduct.name,
      productImage: selectedProduct.image,
      sku: selectedProduct.sku,
      quantity: parseInt(quantity),
      sellingPrice: totalSellingPrice,
      cost: totalCost,
      profit: totalSellingPrice - totalCost,
      status,
      orderDate: new Date().toLocaleDateString('th-TH')
    };

    onAddOrder(newOrder);
    onOpenChange(false);

    // Reset form
    setSelectedProductId("");
    setQuantity("1");
    setCustomCost("");
    setStatus("รอชำระเงิน");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-700">+ เพิ่มออเดอร์ใหม่</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div>
            <Label htmlFor="product">เลือกสินค้า</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสินค้าจากสต็อค" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} - ฿{product.sellingPrice.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">{selectedProduct.sku}</p>
                  <p className="text-sm font-medium text-green-600">฿{selectedProduct.sellingPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="quantity">จำนวน</Label>
            <Input 
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
            />
          </div>

          <div>
            <Label htmlFor="cost">ต้นทุนต่อชิ้น (฿)</Label>
            <Input 
              id="cost"
              type="number"
              value={customCost}
              onChange={(e) => setCustomCost(e.target.value)}
              placeholder={selectedProduct ? selectedProduct.costThb.toString() : "0"}
            />
            {selectedProduct && (
              <p className="text-xs text-gray-500 mt-1">
                ต้นทุนเริ่มต้น: ฿{selectedProduct.costThb.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">สถานะ</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="รอชำระเงิน">รอชำระเงิน</SelectItem>
                <SelectItem value="รอจัดส่ง">รอจัดส่ง</SelectItem>
                <SelectItem value="จัดส่งแล้ว">จัดส่งแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && quantity && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-700 mb-2">สรุปออเดอร์</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>ราคาขายรวม:</span>
                  <span className="font-medium text-green-600">
                    ฿{(selectedProduct.sellingPrice * parseInt(quantity)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ต้นทุนรวม:</span>
                  <span className="font-medium text-red-600">
                    ฿{((customCost ? parseFloat(customCost) : selectedProduct.costThb) * parseInt(quantity)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-medium">กำไรรวม:</span>
                  <span className="font-bold text-blue-600">
                    ฿{(
                      (selectedProduct.sellingPrice * parseInt(quantity)) - 
                      ((customCost ? parseFloat(customCost) : selectedProduct.costThb) * parseInt(quantity))
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-purple-400 hover:bg-purple-500 text-purple-800"
            disabled={!selectedProduct}
          >
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrderModal;
