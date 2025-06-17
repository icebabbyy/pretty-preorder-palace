
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import type { Product } from "@/types";

interface StockBannerProps {
  products: Product[];
}

const StockBanner = ({ products }: StockBannerProps) => {
  const readyToShipCount = products.filter(p => p.status === "พร้อมส่ง").length;
  const preOrderCount = products.filter(p => p.status === "พรีออเดอร์").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">สินค้าพร้อมส่ง</p>
              <p className="text-3xl font-bold text-green-800">{readyToShipCount}</p>
              <p className="text-green-600 text-xs">รายการ</p>
            </div>
            <div className="bg-green-200/50 p-3 rounded-full">
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">สินค้าพรีออเดอร์</p>
              <p className="text-3xl font-bold text-purple-800">{preOrderCount}</p>
              <p className="text-purple-600 text-xs">รายการ</p>
            </div>
            <div className="bg-purple-200/50 p-3 rounded-full">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockBanner;
