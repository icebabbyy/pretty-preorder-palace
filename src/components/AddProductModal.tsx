
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Settings, Upload, Image } from "lucide-react";
import { nanoid } from "nanoid";
import { Product, ProductOption } from "@/types";
import { generateSKU } from "@/utils/sku";
import { fetchProductTypes } from "@/utils/productTypes";
import { fetchProductImages, addProductImage, type ProductImage } from "@/utils/productImages";
import { supabase } from "@/integrations/supabase/client";
import ProductTypeManagementModal from "./ProductTypeManagementModal";
import ProductImageManager from "./ProductImageManager";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: any) => void;
  categories: string[];
  editingProduct?: Product | null;
}

const AddProductModal = ({ open, onOpenChange, onAddProduct, categories, editingProduct }: AddProductModalProps) => {
  const [formData, setFormData] = useState<Product>({
    sku: "",
    name: "",
    category: "",
    categories: [],
    productType: "",
    image: "",
    priceYuan: 0,
    exchangeRate: 1,
    priceThb: 0,
    importCost: 0,
    costThb: 0,
    sellingPrice: 0,
    status: "พรีออเดอร์",
    shipmentDate: "",
    link: "",
    description: ""
  });

  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  // Store file input refs for each option
  const optionFileInputRefs = useRef<{[key: string]: React.RefObject<HTMLInputElement>}>({});

  // Create/update refs whenever options change
  useEffect(() => {
    // Clean up refs for removed options
    const currentOptionIds = options.map(opt => opt.id);
    Object.keys(optionFileInputRefs.current).forEach(refId => {
      if (!currentOptionIds.includes(refId)) {
        delete optionFileInputRefs.current[refId];
      }
    });

    // Create refs for new options
    options.forEach(option => {
      if (!optionFileInputRefs.current[option.id]) {
        optionFileInputRefs.current[option.id] = { current: null };
      }
    });
  }, [options]);

  // Load product types when modal opens
  useEffect(() => {
    if (open) {
      fetchProductTypes().then(setProductTypes).catch(console.error);
    }
  }, [open]);

  // --- Auto-calculate ราคาบาท (THB) ---
  useEffect(() => {
    const y = parseFloat(formData.priceYuan as any) || 0;
    const r = parseFloat(formData.exchangeRate as any) || 0;
    if (y > 0 && r > 0) {
      setFormData(prev => ({
        ...prev,
        priceThb: parseFloat((y * r).toFixed(2))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        priceThb: 0
      }));
    }
    // eslint-disable-next-line
  }, [formData.priceYuan, formData.exchangeRate]);

  // --- Auto-calculate ต้นทุนรวม (costThb) เมื่อราคาบาทหรือค่านำเข้าเปลี่ยน ---
  useEffect(() => {
    const totalCost = (parseFloat(formData.priceThb as any) || 0) + (parseFloat(formData.importCost as any) || 0);
    setFormData(prev => ({ ...prev, costThb: totalCost }));
    // eslint-disable-next-line
  }, [formData.priceThb, formData.importCost]);

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
      setSelectedCategories(editingProduct.categories || [editingProduct.category].filter(Boolean));
      if (editingProduct.options) {
        const optionsWithIds = editingProduct.options.map(opt => ({
          ...opt,
          id: opt.id || nanoid()
        }));
        setOptions(optionsWithIds);
      } else {
        setOptions([]);
      }
      
      if (editingProduct.id) {
        fetchProductImages(editingProduct.id)
          .then(images => {
            setProductImages(images);
            if (images.length > 0) {
              setFormData(prev => ({ ...prev, image: images[0].image_url }));
            }
          })
          .catch(console.error);
      } else {
        setProductImages([]);
      }
    } else {
      setFormData({
        sku: "",
        name: "",
        category: "",
        categories: [],
        productType: "",
        image: "",
        priceYuan: 0,
        exchangeRate: 1,
        priceThb: 0,
        importCost: 0,
        costThb: 0,
        sellingPrice: 0,
        status: "พรีออเดอร์",
        shipmentDate: "",
        link: "",
        description: ""
      });
      setSelectedCategories([]);
      setOptions([]);
      setProductImages([]);
    }
  }, [editingProduct, open]);

  // ถ้าเปิด modal ใหม่ หรือเลือกหมวดหมู่ใหม่และยังไม่มี sku -- auto-gen
  useEffect(() => {
    if (!editingProduct && (!formData.sku || formData.sku === "")) {
      if (selectedCategories.length > 0) {
        setFormData(prev => ({
          ...prev,
          sku: generateSKU(selectedCategories[0])
        }));
      }
    }
  }, [selectedCategories, open]);

// Upload image to Supabase storage
const uploadImageToStorage = async (
  file: File,
  productId: string,
  folder: "main" | "extra" | "variant"
): Promise<string | null> => {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const path = `products/${productId}/${folder}/${filename}`;
    
    const { error } = await supabase
      .storage
      .from("product-images")
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = supabase
      .storage
      .from("product-images")
      .getPublicUrl(path);
      
    return data.publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};


  // Handle option image upload
  const handleOptionImageUpload = async (optionId: string, file: File) => {
    const url = await uploadImageToStorage(file);
    if (url) {
      updateOption(
        options.findIndex(opt => opt.id === optionId), 
        { image: url }
      );
    }
  };

  // Handle option image paste
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

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      if (newCategories.length > 0) {
        setFormData(prevForm => ({
          ...prevForm,
          category: newCategories[0],
          categories: newCategories
        }));
      } else {
        setFormData(prevForm => ({
          ...prevForm,
          category: "",
          categories: []
        }));
      }
      
      return newCategories;
    });
  };

  // เมื่อลูกค้ากด "เพิ่มตัวเลือกสินค้า" จะ auto gen รหัสให้ตัวเลือกด้วย
  const addOption = () => {
    const newOptionId = generateSKU(formData.category) + "-" + (options.length + 1).toString().padStart(3,"0");
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
    
    // Clean up the ref
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

  // อัปเดตกำไรออโต้ ทุกครั้งที่ option ตัวใดๆเปลี่ยน
  useEffect(() => {
    setOptions(opts =>
      opts.map(op => ({ ...op, profit: op.sellingPrice - op.costThb }))
    );
  }, [options.length]);

  const handleImagesChange = (images: ProductImage[]) => {
    setProductImages(images);
    if (images.length > 0) {
      setFormData(prev => ({ ...prev, image: images[0].image_url }));
    } else {
      setFormData(prev => ({ ...prev, image: "" }));
    }
  };

  const handleSubmit = async () => {
  if (!formData.name || selectedCategories.length === 0) {
    alert("กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่");
    return;
  }

  let quantity = formData.quantity;
  if (options.length > 0) {
    quantity = options.reduce((sum, o) => sum + (o.quantity || 0), 0);
  }

  // สมมติ productId สร้างจาก timestamp (ถ้ามี productId จริงใช้ตัวนั้น)
  const productId = `${Date.now()}`; 

  const uploadedImages: ProductImage[] = [];

  for (let i = 0; i < productImages.length; i++) {
    const img = productImages[i];
    if (img.file) {  // สมมติ productImages เก็บ File ไว้ใน field file
      const folder = i === 0 ? "main" : "extra"; // รูปแรก = main, ที่เหลือ = extra
      const url = await uploadImageToStorage(img.file, productId, folder);
      if (url) {
        uploadedImages.push({
          image_url: url,
          file: undefined // ไม่ต้องเก็บ file แล้ว
        });
      }
    } else {
      // เผื่อเป็น URL ที่มีอยู่แล้ว
      uploadedImages.push(img);
    }
  }

  const dataToSave = {
    ...formData,
    categories: selectedCategories,
    category: selectedCategories[0],
    quantity,
    options: options.length > 0 ? options : undefined,
    images: uploadedImages
  };

  try {
    await onAddProduct(dataToSave);
    onOpenChange(false);
  } catch (err) {
    console.error("Add product failed", err);
  }
};

      if (!editingProduct) {
        setFormData({
          sku: "",
          name: "",
          category: "",
          categories: [],
          productType: "",
          image: "",
          priceYuan: 0,
          exchangeRate: 1,
          priceThb: 0,
          importCost: 0,
          costThb: 0,
          sellingPrice: 0,
          status: "พรีออเดอร์",
          shipmentDate: "",
          link: "",
          description: ""
        });
        setSelectedCategories([]);
        setOptions([]);
        setProductImages([]);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกสินค้า");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-purple-800">
              {editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-6">
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

            {/* ประเภทสินค้า */}
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
                  onClick={() => setShowProductTypeModal(true)}
                  className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* หมวดหมู่ */}
            <div>
              <Label>หมวดหมู่ * (เลือกได้หลายหมวดหมู่)</Label>
              <div className="mt-2 space-y-2">
                {/* แสดงหมวดหมู่ที่เลือกแล้ว */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedCategories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                        {cat}
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* รายการหมวดหมู่ทั้งหมด */}
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-purple-200 rounded-lg p-3">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                        className="border-purple-300"
                      />
                      <Label 
                        htmlFor={`category-${category}`} 
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* รูปภาพสินค้า - ใช้ ProductImageManager */}
            <ProductImageManager
              productId={editingProduct?.id}
              images={productImages}
              onImagesChange={handleImagesChange}
              disabled={false}
              productOptions={options}
            />

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

            {/* ตัวเลือกสินค้า */}
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
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-purple-200">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg"
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              disabled={!formData.name || selectedCategories.length === 0}
            >
              {editingProduct ? "บันทึกการแก้ไข" : "บันทึก"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Type Management Modal */}
      <ProductTypeManagementModal
        open={showProductTypeModal}
        onOpenChange={setShowProductTypeModal}
        productTypes={productTypes}
        setProductTypes={setProductTypes}
      />
    </>
  );
};

export default AddProductModal;
