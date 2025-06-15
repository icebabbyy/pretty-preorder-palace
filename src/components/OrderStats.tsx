
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

interface OrderStatsProps {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

const OrderStats: React.FC<OrderStatsProps> = ({ totalRevenue, totalCost, totalProfit }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <Card className="bg-white border border-purple-200 rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">มูลค่าขาย</p>
            <p className="text-2xl font-bold text-green-600">฿{(totalRevenue ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white border border-purple-200 rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Package className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">ต้นทุนรวม</p>
            <p className="text-2xl font-bold text-red-600">฿{(totalCost ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white border border-purple-200 rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">กำไรรวม</p>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ฿{(totalProfit ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default OrderStats;
