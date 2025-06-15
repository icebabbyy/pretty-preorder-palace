import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  items: OrderItem[];
  totalSellingPrice: number;
  status: string;
  username: string;
  token: string; // ต้องมีในข้อมูล order แต่ละตัว
}

const TrackOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // สมมุติ orders ถูกเก็บใน localStorage (หรือดึงจาก API)
    const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]");
    const found = orders.find(
      (o) => o.id.toString() === orderId && o.token === token
    );
    if (found) {
      setOrder(found);
    } else {
      setNotFound(true);
    }
  }, [orderId, token]);

  if (notFound) {
    return <div className="text-center mt-16 text-red-500">ไม่พบออเดอร์ หรือ token ไม่ถูกต้อง</div>;
  }
  if (!order) {
    return <div className="text-center mt-16 text-gray-500">กำลังโหลด...</div>;
  }

  return (
    <div className="max-w-lg mx-auto my-12 bg-white shadow rounded-xl p-6 border border-purple-200">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">เช็คสถานะออเดอร์</h1>
      <div className="mb-4">
        <span className="font-semibold text-gray-700">ลูกค้า:</span>{" "}
        <span className="text-purple-700">{order.username}</span>
      </div>
      <div className="mb-4">
        <span className="font-semibold text-gray-700">สถานะ:</span>{" "}
        <span className="text-blue-700">{order.status}</span>
      </div>
      <div className="mb-4">
        <span className="font-semibold text-gray-700">ยอดรวม:</span>{" "}
        <span className="text-green-700 font-bold">฿{order.totalSellingPrice.toLocaleString()}</span>
      </div>
      <div>
        <span className="font-semibold text-gray-700">รายการสินค้า:</span>
        <ul className="mt-2 space-y-3">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3 border-b pb-2">
              <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded border" />
              <div>
                <div className="font-medium">{item.productName}</div>
                <div className="text-sm text-gray-500">จำนวน: {item.quantity} | ฿{item.unitPrice.toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrackOrder;
