
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
      <Card className="bg-gradient-to-r from-purple-400 to-purple-600 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">สินค้าพร้อมส่ง</p>
              <p className="text-3xl font-bold">{readyToShipCount}</p>
              <p className="text-purple-100 text-xs">รายการ</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Package className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">สินค้าพรีออเดอร์</p>
              <p className="text-3xl font-bold">{preOrderCount}</p>
              <p className="text-blue-100 text-xs">รายการ</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Package className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockBanner;
