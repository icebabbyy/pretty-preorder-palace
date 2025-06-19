
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/types";

interface EditOrderOptionSelectorProps {
  selectedEditIdx: number | null;
  selectedEditOptionId: string;
  setSelectedEditOptionId: (value: string) => void;
  products: Product[];
  items: any[];
  onConfirmEdit: () => void;
  onCancel: () => void;
}

const EditOrderOptionSelector: React.FC<EditOrderOptionSelectorProps> = ({
  selectedEditIdx,
  selectedEditOptionId,
  setSelectedEditOptionId,
  products,
  items,
  onConfirmEdit,
  onCancel,
}) => {
  if (selectedEditIdx === null || products.length === 0) return null;
  
  const item = items[selectedEditIdx];
  const product = products.find(p => p.id === item.productId);
  const opts = product?.options || [];
  
  if (opts.length === 0) return null;

  return (
    <div className="my-2">
      <Label>เลือกตัวเลือกสินค้าใหม่</Label>
      <Select value={selectedEditOptionId} onValueChange={setSelectedEditOptionId}>
        <SelectTrigger className="border border-purple-200 rounded-lg w-64 mt-1">
          <SelectValue placeholder="เลือกตัวเลือกสินค้า" />
        </SelectTrigger>
        <SelectContent>
          {opts.map((opt, index) => {
            // Create a guaranteed non-empty value
            const optionValue = (opt.id && typeof opt.id === 'string' && opt.id.trim() !== '') 
              ? opt.id.trim()
              : `fallback-edit-option-${index}-${Date.now()}`;
            
            console.log('Edit option value generated:', optionValue, 'for option:', opt);
            
            return (
              <SelectItem 
                key={`edit-option-${index}-${optionValue}`} 
                value={optionValue}
              >
                {`${product?.name} (${opt.name}) ฿${opt.sellingPrice}`}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <div className="flex gap-2 mt-2">
        <Button onClick={onConfirmEdit} className="bg-green-500 text-white">เปลี่ยนตัวเลือก</Button>
        <Button onClick={onCancel} variant="outline">ยกเลิก</Button>
      </div>
    </div>
  );
};

export default EditOrderOptionSelector;
