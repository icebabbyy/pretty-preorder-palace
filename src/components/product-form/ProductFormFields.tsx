
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Product } from "@/types";

interface ProductFormFieldsProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  productTypes: string[];
  onShowProductTypeModal: () => void;
}

const ProductFormFields = ({ formData, setFormData, productTypes, onShowProductTypeModal }: ProductFormFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input 
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="รหัสสินค้า (Auto generate ถ้าเว้นว่าง)"
            className="border border-purple-200 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="name">ชื่อสินค้า *</Label>
          <Input 
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ชื่อสินค้า"
            className="border border-purple-200 rounded-lg"
          />
        </div>
      </div>

      <div>
        <Label>ประเภทสินค้า</Label>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Select value={formData.productType} onValueChange={(value) => setFormData({ ...formData, productType: value })}>
              <SelectTrigger className="border border-purple-200 rounded-lg">
                <SelectValue placeholder="เลือกประเภทสินค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ไม่ระบุ</SelectItem>
                {productTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onShowProductTypeModal}
            className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">สถานะ</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger className="border border-purple-200 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="พรีออเดอร์">พรีออเดอร์</SelectItem>
              <SelectItem value="พร้อมส่ง">พร้อมส่ง</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="shipmentDate">วันที่จัดส่ง</Label>
          <Input 
            id="shipmentDate"
            type="date"
            value={formData.shipmentDate}
            onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })}
            className="border border-purple-200 rounded-lg"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="link">ลิงก์สินค้า</Label>
        <Input 
          id="link"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          placeholder="https://..."
          className="border border-purple-200 rounded-lg"
        />
      </div>

      <div>
        <Label htmlFor="description">รายละเอียด</Label>
        <Textarea 
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="รายละเอียดสินค้า"
          className="border border-purple-200 rounded-lg"
          rows={3}
        />
      </div>
    </>
  );
};

export default ProductFormFields;
