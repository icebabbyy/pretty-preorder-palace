
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, AlertCircle, Clock, Truck, CheckCircle, Package } from "lucide-react";
import type { Order } from "@/types";

interface OrdersTableProps {
  orders: Order[];
  updateOrderStatus: (order: Order, newStatus: string) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: number) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "รอชำระเงิน": return <AlertCircle className="w-5 h-5" />;
    case "รอโรงงานจัดส่ง": return <Clock className="w-5 h-5" />;
    case "กำลังมาไทย": return <Truck className="w-5 h-5" />;
    case "จัดส่งแล้ว": return <CheckCircle className="w-5 h-5" />;
    default: return <Package className="w-5 h-5" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "รอชำระเงิน": return "text-yellow-600 bg-yellow-100";
    case "รอโรงงานจัดส่ง": return "text-orange-600 bg-orange-100";
    case "กำลังมาไทย": return "text-blue-600 bg-blue-100";
    case "จัดส่งแล้ว": return "text-green-600 bg-green-100";
    default: return "text-gray-600 bg-gray-100";
  }
};

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  updateOrderStatus,
  onEdit,
  onDelete,
}) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow className="bg-purple-50 border-b border-purple-100">
          <TableHead className="text-purple-800 font-bold">สินค้า</TableHead>
          <TableHead className="text-purple-800 font-bold">ลูกค้า</TableHead>
          <TableHead className="text-purple-800 font-bold">ราคาขาย</TableHead>
          <TableHead className="text-purple-800 font-bold">ส่วนลด</TableHead>
          <TableHead className="text-purple-800 font-bold">ต้นทุน</TableHead>
          <TableHead className="text-purple-800 font-bold">กำไร</TableHead>
          <TableHead className="text-purple-800 font-bold">สถานะ</TableHead>
          <TableHead className="text-purple-800 font-bold">วันที่</TableHead>
          <TableHead className="text-purple-800 font-bold">จัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8 text-gray-500">
              ไม่มีออเดอร์ในระบบ กรุณาเพิ่มออเดอร์ใหม่
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => {
            // Ensure order status is never empty - stronger validation
            let currentStatus = "รอชำระเงิน"; // Default fallback
            
            if (order.status && typeof order.status === 'string' && order.status.trim() !== '') {
              currentStatus = order.status.trim();
            }
            
            // Validate that the status is one of the allowed values
            const allowedStatuses = ["รอชำระเงิน", "รอโรงงานจัดส่ง", "กำลังมาไทย", "จัดส่งแล้ว"];
            if (!allowedStatuses.includes(currentStatus)) {
              currentStatus = "รอชำระเงิน";
            }
            
            console.log('Orders Table - Order status validated:', currentStatus, 'for order:', order.id);
            
            return (
              <TableRow key={order.id} className="hover:bg-purple-25 border-b border-purple-50">
                <TableCell>
                  <div className="space-y-2">
                    {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-8 h-8 rounded object-cover border border-purple-200"
                        />
                        <div>
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-purple-500">{item.sku} x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-purple-700">{order.username}</p>
                    {(order.deposit ?? 0) > 0 && (
                      <p className="text-xs text-green-600">มัดจำ: ฿{(order.deposit ?? 0).toLocaleString()}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-green-600">
                  ฿{(order.totalSellingPrice ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className="font-semibold text-red-600">
                  {(order.discount ?? 0) > 0 ? `-฿${(order.discount ?? 0).toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="font-semibold text-red-600">
                  ฿{(order.totalCost ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className={`font-semibold ${(order.profit ?? 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ฿{(order.profit ?? 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Select
                    value={currentStatus}
                    onValueChange={(newStatus) => updateOrderStatus(order, newStatus)}
                  >
                    <SelectTrigger className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                      {getStatusIcon(currentStatus)}
                      <SelectValue placeholder={currentStatus} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="รอชำระเงิน">รอชำระเงิน</SelectItem>
                      <SelectItem value="รอโรงงานจัดส่ง">รอโรงงานจัดส่ง</SelectItem>
                      <SelectItem value="กำลังมาไทย">กำลังมาไทย</SelectItem>
                      <SelectItem value="จัดส่งแล้ว">จัดส่งแล้ว</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm">
                  {order.paymentDate
                    ? new Date(order.paymentDate).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:bg-purple-50"
                      onClick={() => onEdit(order)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(order.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  </div>
);

export default OrdersTable;
