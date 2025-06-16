
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface DateFilterBarProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

const DateFilterBar = ({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }: DateFilterBarProps) => {
  const months = [
    { value: "all", label: "ทุกเดือน" },
    { value: "01", label: "มกราคม" },
    { value: "02", label: "กุมภาพันธ์" },
    { value: "03", label: "มีนาคม" },
    { value: "04", label: "เมษายน" },
    { value: "05", label: "พฤษภาคม" },
    { value: "06", label: "มิถุนายน" },
    { value: "07", label: "กรกฎาคม" },
    { value: "08", label: "สิงหาคม" },
    { value: "09", label: "กันยายน" },
    { value: "10", label: "ตุลาคม" },
    { value: "11", label: "พฤศจิกายน" },
    { value: "12", label: "ธันวาคม" }
  ];

  const currentYear = new Date().getFullYear();
  const years = [
    { value: "all", label: "ทุกปี" },
    ...Array.from({ length: 5 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i + 543).toString() // แปลงเป็น พ.ศ.
    }))
  ];

  return (
    <div className="flex items-center gap-3">
      <Calendar className="w-4 h-4 text-purple-600" />
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-40 border border-purple-200 rounded-lg">
          <SelectValue placeholder="เลือกเดือน" />
        </SelectTrigger>
        <SelectContent>
          {months.map(month => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-32 border border-purple-200 rounded-lg">
          <SelectValue placeholder="เลือกปี" />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year.value} value={year.value}>
              {year.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DateFilterBar;
