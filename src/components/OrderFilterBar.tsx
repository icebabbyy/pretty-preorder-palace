
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

interface OrderFilterBarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onAddOrderClick: () => void;
}

const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onAddOrderClick
}) => (
  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
    <div className="flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="ค้นหาออเดอร์..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border border-purple-200 rounded-lg"
        />
      </div>
    </div>
    <div className="flex gap-3 items-center">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48 border border-purple-200 rounded-lg">
          <SelectValue placeholder="สถานะทั้งหมด" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">สถานะทั้งหมด</SelectItem>
          <SelectItem value="รอชำระเงิน">รอชำระเงิน</SelectItem>
          <SelectItem value="รอโรงงานจัดส่ง">รอโรงงานจัดส่ง</SelectItem>
          <SelectItem value="กำลังมาไทย">กำลังมาไทย</SelectItem>
          <SelectItem value="จัดส่งแล้ว">จัดส่งแล้ว</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={onAddOrderClick}
        className="bg-purple-500 hover:bg-purple-600 text-white border border-purple-400 rounded-lg"
      >
        <Plus className="w-4 h-4 mr-2" />
        เพิ่มออเดอร์
      </Button>
    </div>
  </div>
);

export default OrderFilterBar;
