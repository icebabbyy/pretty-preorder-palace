
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, Truck, CheckCircle, Package } from "lucide-react";

interface OrderStatusBannerProps {
  statusCounts: { [key: string]: number };
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

const OrderStatusBanner: React.FC<OrderStatusBannerProps> = ({ statusCounts }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {Object.entries(statusCounts).map(([status, count]) => (
      <Card key={status} className="bg-white border border-purple-200 rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
            </div>
            <div>
              <p className="text-xs text-gray-600">{status}</p>
              <p className="text-lg font-bold text-gray-800">{count} ออเดอร์</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default OrderStatusBanner;
