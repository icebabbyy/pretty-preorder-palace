import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";

interface ProductPricingFieldsProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
}

const ProductPricingFields = ({ formData, setFormData }: ProductPricingFieldsProps) => {

  // 1. สร้างฟังก์ชัน handleChange กลาง เพื่อจัดการ Input ที่เป็นตัวเลขทั้งหมด
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // ถ้าผู้ใช้ลบค่าทั้งหมดในช่อง (value === ''), ให้กำหนดค่าเป็น 0
    // มิฉะนั้นให้แปลงเป็นตัวเลขทศนิยม (parseFloat)
    const numericValue = value === '' ? 0 : parseFloat(value);

    // อัปเดต State โดยใช้ Functional Update เพื่อความปลอดภัย
    setFormData(prev => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">การกำหนดราคา</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {/* 2. แก้ไข Input ทุกช่องให้เรียกใช้ handleNumericChange และเพิ่ม 'name' attribute */}

          <div className="space-y-1.5">
            <Label htmlFor="priceYuan">ราคาหยวน</Label>
            <Input 
              id="priceYuan"
              name="priceYuan" // <-- เพิ่ม name ให้ตรงกับ key ใน state
              type="number"
              step="0.01"
              value={formData.priceYuan || ''} // ใช้ || '' เพื่อป้องกัน warning ตอนค่าเป็น 0
              onChange={handleNumericChange} // <-- เรียกใช้ฟังก์ชันกลาง
              placeholder="0.00"
              className="border-purple-200 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exchangeRate">อัตราแลกเปลี่ยน</Label>
            <Input 
              id="exchangeRate"
              name="exchangeRate" // <-- เพิ่ม name
              type="number"
              step="0.0001"
              value={formData.exchangeRate || ''}
              onChange={handleNumericChange} // <-- เรียกใช้ฟังก์ชันกลาง
              placeholder="5.0"
              className="border-purple-200 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priceThb">ราคาบาท (คำนวณอัตโนมัติ)</Label>
            <Input 
              id="priceThb"
              type="number"
              value={formData.priceThb || ''}
              readOnly
              className="border-purple-200 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="importCost">ค่านำเข้า (บาท)</Label>
            <Input 
              id="importCost"
              name="importCost" // <-- เพิ่ม name
              type="number"
              step="0.01"
              value={formData.importCost || ''}
              onChange={handleNumericChange} // <-- เรียกใช้ฟังก์ชันกลาง
              placeholder="0.00"
              className="border-purple-200 rounded-lg"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="costThb">ต้นทุนรวม (คำนวณอัตโนมัติ)</Label>
            <Input 
              id="costThb"
              type="number"
              value={formData.costThb || ''}
              readOnly
              className="border-purple-200 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sellingPrice">ราคาขาย</Label>
            <Input 
              id="sellingPrice"
              name="sellingPrice" // <-- เพิ่ม name
              type="number"
              step="0.01"
              value={formData.sellingPrice || ''}
              onChange={handleNumericChange} // <-- เรียกใช้ฟังก์ชันกลาง
              placeholder="0.00"
              className="border-purple-200 rounded-lg"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPricingFields;
