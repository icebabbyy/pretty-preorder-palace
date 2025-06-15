
interface OrderSummaryProps {
  totalSellingPrice: number;
  discountAmount: number;
  finalSellingPrice: number;
  totalCost: number;
  shipping: number;
  depositAmount: number;
  profit: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  totalSellingPrice,
  discountAmount,
  finalSellingPrice,
  totalCost,
  shipping,
  depositAmount,
  profit
}) => (
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
);

export default OrderSummary;
