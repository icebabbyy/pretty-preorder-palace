
import { useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ProductOption } from "@/types";
import { generateSKU } from "@/utils/sku";
import { uploadImageToStorage } from "@/utils/productImages";

interface ProductOptionsManagerProps {
  options: ProductOption[];
  setOptions: React.Dispatch<React.SetStateAction<ProductOption[]>>;
  category: string;
  editingProductId?: number;
}

const ProductOptionsManager = ({ options, setOptions, category, editingProductId }: ProductOptionsManagerProps) => {
  const optionFileInputRefs = useRef<{[key: string]: React.RefObject<HTMLInputElement>}>({});

  useEffect(() => {
    const currentOptionIds = options.map(opt => opt.id);
    Object.keys(optionFileInputRefs.current).forEach(refId => {
      if (!currentOptionIds.includes(refId)) {
        delete optionFileInputRefs.current[refId];
      }
    });

    options.forEach(option => {
      if (!optionFileInputRefs.current[option.id]) {
        optionFileInputRefs.current[option.id] = { current: null };
      }
    });
  }, [options]);

  const addOption = () => {
    const newOptionId = generateSKU(category) + "-" + (options.length + 1).toString().padStart(3,"0");
    const newOption = {
      id: newOptionId,
      name: "",
      image: "",
      costThb: 0,
      sellingPrice: 0,
      quantity: 0,
      profit: 0
    };
    
    setOptions(opts => [...opts, newOption]);
  };

  const removeOption = (idx: number) => {
    const removedOption = options[idx];
    setOptions(opts => opts.filter((_, i) => i !== idx));
    
    if (optionFileInputRefs.current[removedOption.id]) {
      delete optionFileInputRefs.current[removedOption.id];
    }
  };

  const updateOption = (idx: number, update: Partial<Omit<ProductOption, "id" | "profit">>) => {
    setOptions(opts =>
      opts.map((op, i) =>
        i === idx
          ? {
              ...op,
              ...update,
              profit: ((update.sellingPrice ?? op.sellingPrice) - (update.costThb ?? op.costThb)),
            }
          : op
      )
    );
  };

  const handleOptionImageUpload = async (optionId: string, file: File) => {
    const productId = editingProductId || Date.now();
    // Fix: Pass only 2 arguments - file and pathPrefix
    const url = await uploadImageToStorage(file, productId.toString());
    if (url) {
      updateOption(
        options.findIndex(opt => opt.id === optionId), 
        { image: url }
      );
    }
  };

  const handleOptionImagePaste = async (optionId: string, e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          await handleOptionImageUpload(optionId, file);
        }
      }
    }
  };

  return (
    <div>
      <Label className="font-semibold">ตัวเลือกสินค้า (ถ้ามี)</Label>
      <div className="space-y-2">
        {options.map((option, idx) => (
          <div key={option.id} className="border border-purple-200 p-4 rounded-lg mb-2 relative bg-purple-50">
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-2">
                <Label>ชื่อ/ตัวเลือก</Label>
                <Input
                  value={option.name}
                  onChange={e => updateOption(idx, { name: e.target.value })}
                  placeholder="เช่น สีแดง, L, หรือลายแมว"
                  className="border border-purple-200 rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <Label>SKU Option</Label>
                <Input
                  readOnly
                  value={option.id}
                  className="border border-purple-200 rounded-lg bg-gray-50"
                />
              </div>
              <div className="col-span-3">
                <Label>รูปภาพ</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      ref={optionFileInputRefs.current[option.id]}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleOptionImageUpload(option.id, file);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => optionFileInputRefs.current[option.id]?.current?.click()}
                      className="border border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      อัปโหลด
                    </Button>
                    <Input
                      type="text"
                      value={option.image}
                      onChange={e => updateOption(idx, { image: e.target.value })}
                      placeholder="หรือใส่ URL"
                      className="border border-purple-200 rounded-lg flex-1"
                      onPaste={(e) => handleOptionImagePaste(option.id, e)}
                    />
                  </div>
                  {option.image && (
                    <div className="flex justify-center">
                      <img
                        src={option.image}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded border"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            "https://ui-avatars.com/api/?name=No+Image";
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    💡 Ctrl+V เพื่อ paste รูปภาพ
                  </p>
                </div>
              </div>
              <div className="col-span-2">
                <Label>ต้นทุนรวม (บาท)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={option.costThb}
                  onChange={e => updateOption(idx, { costThb: parseFloat(e.target.value) || 0 })}
                  className="border border-purple-200 rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <Label>ราคาขาย (บาท)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={option.sellingPrice}
                  onChange={e => updateOption(idx, { sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="border border-purple-200 rounded-lg"
                />
              </div>
              <div className="col-span-1">
                <Label>จำนวน</Label>
                <Input
                  type="number"
                  value={option.quantity}
                  onChange={e => updateOption(idx, { quantity: parseInt(e.target.value) || 0 })}
                  className="border border-purple-200 rounded-lg"
                />
              </div>
              <div className="col-span-1">
                <Label>กำไร</Label>
                <Input
                  readOnly
                  value={option.profit}
                  className="border border-purple-200 rounded-lg bg-gray-50"
                />
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  type="button"
                  className="text-red-500 underline text-sm ml-2"
                  onClick={() => removeOption(idx)}
                  tabIndex={-1}
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="text-purple-700 border border-purple-300 rounded"
          onClick={addOption}
        >
          + เพิ่มตัวเลือกสินค้า
        </Button>
      </div>
    </div>
  );
};

export default ProductOptionsManager;
