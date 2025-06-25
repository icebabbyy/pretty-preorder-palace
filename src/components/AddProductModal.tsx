// src/app/admin/products/AddProductModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, ProductOption, ProductImage } from "@/types";
import { generateSKU } from "@/utils/sku";
import { fetchProductTypes } from "@/utils/productTypes";
import { uploadImageToStorage } from "@/utils/productImages";
import ProductTypeManagementModal from "./ProductTypeManagementModal";
import ProductImageManager from "./ProductImageManager";
import ProductFormFields from "./product-form/ProductFormFields";
import ProductCategorySelector from "./product-form/ProductCategorySelector";
import ProductPricingFields from "./product-form/ProductPricingFields";
import ProductOptionsManager from "./product-form/ProductOptionsManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast"; // --- 1. IMPORT Toast ---

// --- 2. IMPORT ฟังก์ชันที่เราแก้ไขกันมาอย่างยาวนาน ---
import { addProduct, updateProduct, fetchProduct } from "@/utils/products"; 

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: any) => void; // เปลี่ยนชื่อ prop เพื่อความชัดเจน
  categories: string[];
  editingProduct?: Product | null;
}

const AddProductModal = ({ open, onOpenChange, onAddProduct, categories, editingProduct }: AddProductModalProps) => {
  const { toast } = useToast(); // --- 3. เตรียม Toast ไว้ใช้งาน ---
  const [formData, setFormData] = useState<Product>({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 5.0, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "", quantity: 0, tags: [] });
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Initialize form state ---
  useEffect(() => {
    if (open) {
      if (editingProduct && editingProduct.id) {
        // ใช้ฟังก์ชัน fetchProduct ที่ดึงข้อมูลได้ครบถ้วนรวมถึง tags
        fetchProduct(editingProduct.id).then(fullProduct => {
          setFormData({ ...fullProduct, quantity: fullProduct.quantity || 0 });
          setSelectedCategories(fullProduct.categories || []);
          setOptions(fullProduct.options?.map(opt => ({ ...opt, id: opt.id || `temp-${Math.random()}` })) || []);
          setProductImages(fullProduct.images || []);
          setSelectedTags(fullProduct.tags || []);
        });
      } else {
        // Reset form for new product
        setFormData({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 5.0, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "", quantity: 0, tags: [] });
        setSelectedCategories([]);
        setOptions([]);
        setProductImages([]);
        setSelectedTags([]);
        setTagInput("");
      }
      fetchProductTypes().then(setProductTypes).catch(console.error);
    }
  }, [editingProduct, open]);

  // (ส่วน useEffect อื่นๆ ไม่ต้องแก้ไข)
  useEffect(() => {
    const yuan = parseFloat(String(formData.priceYuan)) || 0;
    const rate = parseFloat(String(formData.exchangeRate)) || 0;
    const importFee = parseFloat(String(formData.importCost)) || 0;
    const newPriceThb = (yuan > 0 && rate > 0) ? parseFloat((yuan * rate).toFixed(2)) : 0;
    const newCostThb = newPriceThb + importFee;
    setFormData(prev => (prev.priceThb !== newPriceThb || prev.costThb !== newCostThb) ? { ...prev, priceThb: newPriceThb, costThb: newCostThb } : prev);
  }, [formData.priceYuan, formData.exchangeRate, formData.importCost]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, categories: selectedCategories, category: selectedCategories[0] || "" }));
    if (!editingProduct && !formData.sku && selectedCategories.length > 0) {
      setFormData(prev => ({ ...prev, sku: generateSKU(selectedCategories[0]) }));
    }
  }, [selectedCategories]);


  // --- Handler Functions (toggleCategory, handleImagesChange ไม่ต้องแก้ไข) ---
  const toggleCategory = (category: string) => setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  const handleImagesChange = (images: ProductImage[]) => {
    setProductImages(images);
    const mainImage = images.find(img => img.order === 1);
    setFormData(prev => ({ ...prev, image: mainImage ? mainImage.image_url : (images[0]?.image_url || "") }));
  };

  // --- 4. แก้ไข handleSubmit ทั้งหมด ---
const handleSubmit = async () => {
  if (!formData.name || selectedCategories.length === 0) {
    alert("กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่"); return;
  }
  
  setIsSubmitting(true);
  try {
    const uploadedImagePromises = productImages.map(async (image) => {
      if (image.file) {
        const newUrl = await uploadImageToStorage(image.file, String(editingProduct?.id || 'new'));
        const { file, ...rest } = image;
        return { ...rest, image_url: newUrl };
      }
      return image;
    });
    const uploadedImages = await Promise.all(uploadedImagePromises);

    const quantity = options.length > 0 ? options.reduce((sum, o) => sum + (o.quantity || 0), 0) : (formData.quantity || 0);
    
    const dataToSave = {
      ...formData,
      id: editingProduct?.id,
      quantity,
      options: options.length > 0 ? options : undefined,
      images: uploadedImages,
      tags: selectedTags,
    };
    
    let savedProduct; // สร้างตัวแปรมารับผลลัพธ์
    if (editingProduct) {
      savedProduct = await updateProduct(dataToSave as Product);
    } else {
      const { id, ...addData } = dataToSave;
      savedProduct = await addProduct(addData);
    }
    
    toast({
      title: "บันทึกสำเร็จ!",
      description: `สินค้า "${savedProduct.name}" ถูกบันทึกเรียบร้อยแล้ว`,
      className: "bg-green-500 text-white",
    });

    // --- แก้ไขจุดนี้: เรียกใช้ onAddProduct พร้อมส่งข้อมูลกลับไป ---
    onAddProduct(savedProduct); 
    
    onOpenChange(false);

  } catch (error) {
    console.error("Error saving product:", error);
    toast({
      variant: "destructive",
      title: "เกิดข้อผิดพลาด",
      description: "ไม่สามารถบันทึกข้อมูลได้: " + (error instanceof Error ? error.message : 'Unknown error'),
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

  // --- JSX (Return) ไม่มีการเปลี่ยนแปลงมากนัก ---
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl">{editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <ProductFormFields formData={formData} setFormData={setFormData} productTypes={productTypes} onShowProductTypeModal={() => setShowProductTypeModal(true)} />
            <ProductCategorySelector categories={categories} selectedCategories={selectedCategories} toggleCategory={toggleCategory} />
            
            <Card>
              <CardHeader><CardTitle className="text-base">Tags</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[2.5rem]">
                  {selectedTags.map(tag => (
                    <div key={tag} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium">
                      <span>{tag}</span>
                      <button type="button" onClick={() => setSelectedTags(current => current.filter(t => t !== tag))} className="ml-2 text-gray-500 hover:text-gray-700">&times;</button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newTag = tagInput.trim();
                        if (newTag && !selectedTags.find(t => t.toLowerCase() === newTag.toLowerCase())) {
                          setSelectedTags(curr => [...curr, newTag]);
                        }
                        setTagInput("");
                      }
                    }} placeholder="พิมพ์ Tag แล้วกด Enter..."
                  />
                  <Button type="button" onClick={() => {
                    const newTag = tagInput.trim();
                    if (newTag && !selectedTags.find(t => t.toLowerCase() === newTag.toLowerCase())) {
                      setSelectedTags(curr => [...curr, newTag]);
                    }
                    setTagInput("");
                  }}>เพิ่ม</Button>
                </div>
              </CardContent>
            </Card>

            <ProductImageManager productId={editingProduct?.id} images={productImages} onImagesChange={handleImagesChange} disabled={isSubmitting} productOptions={options} />
            <ProductPricingFields formData={formData} setFormData={setFormData} />
            <ProductOptionsManager options={options} setOptions={setOptions} category={selectedCategories[0] || ""} editingProductId={editingProduct?.id} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>ยกเลิก</Button>
            <Button onClick={handleSubmit} disabled={!formData.name || selectedCategories.length === 0 || isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ProductTypeManagementModal open={showProductTypeModal} onOpenChange={setShowProductTypeModal} productTypes={productTypes} setProductTypes={setProductTypes} />
    </>
  );
};

export default AddProductModal;
