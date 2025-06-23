
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";

interface ProductPricingFieldsProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
}

const ProductPricingFields = ({ formData, setFormData }: ProductPricingFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="priceYuan">ราคาหยวน</Label>
          <Input 
            id="priceYuan"
            type="number"
            step="0.01"
            value={formData.priceYuan}
            onChange={(e) => setFormData({ ...formData, priceYuan: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="border border-purple-200 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="exchangeRate">อัตราแลกเปลี่ยน</Label>
          <Input 
            id="exchangeRate"
            type="number"
            step="0.0001"
            value={formData.exchangeRate}
            onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1 })}
            placeholder="1"
            className="border border-purple-200 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="priceThb">ราคาบาท</Label>
          <Input 
            id="priceThb"
            type="number"
            step="0.01"
            value={formData.priceThb}
            readOnly
            className="border border-purple-200 rounded-lg bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="importCost">ค่านำเข้า (บาท)</Label>
          <Input 
            id="importCost"
            type="number"
            step="0.01"
            value={formData.importCost}
            onChange={(e) => setFormData({ ...formData, importCost: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="border border-purple-200 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="costThb">ต้นทุนรวม (บาท)</Label>
          <Input 
            id="costThb"
            type="number"
            step="0.01"
            value={formData.costThb}
            readOnly
            className="border border-purple-200 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <Label htmlFor="sellingPrice">ราคาขาย</Label>
          <Input 
            id="sellingPrice"
            type="number"
            step="0.01"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="border border-purple-200 rounded-lg"
          />
        </div>
      </div>
    </>
  );
};

export default ProductPricingFields;
