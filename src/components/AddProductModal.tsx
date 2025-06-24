// src/components/AddProductModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // **เพิ่ม: Import Input**
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // **เพิ่ม: Import Card components**
import { nanoid } from "nanoid";
import { Product, ProductOption, ProductImage, Tag } from "@/types"; // 1. Import Type 'Tag' ยังคงเดิม
import { generateSKU } from "@/utils/sku";
import { fetchProductTypes } from "@/utils/productTypes";
import { fetchProductImages, uploadImageToStorage } from "@/utils/productImages";
import ProductTypeManagementModal from "./ProductTypeManagementModal";
import ProductImageManager from "./ProductImageManager";
import ProductFormFields from "./product-form/ProductFormFields";
import ProductCategorySelector from "./product-form/ProductCategorySelector";
import ProductPricingFields from "./product-form/ProductPricingFields";
import ProductOptionsManager from "./product-form/ProductOptionsManager";
// 2. ไม่ต้อง Import 'react-select' อีกต่อไป
import { supabase } from "@/integrations/supabase/client";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: any) => void;
  categories: string[];
  editingProduct?: Product | null;
}

const AddProductModal = ({ open, onOpenChange, onAddProduct, categories, editingProduct }: AddProductModalProps) => {
  // --- (State เดิมส่วนใหญ่ยังอยู่ครบ) ---
  const [formData, setFormData] = useState<Product>({
    sku: "", name: "", category: "", categories: [], productType: "", image: "",
    priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0,
    sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "",
  });
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  // --- 3. State สำหรับจัดการ Tag (โครงสร้างยังเหมือนเดิม) ---
  const [allTags, setAllTags] = useState<{ value: string; label: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<{ value: string; label: string }[]>([]);
  
  // **เพิ่ม: State สำหรับเก็บค่าที่พิมพ์ในช่อง Tag input**
  const [tagInput, setTagInput] = useState("");


  // --- (useEffect เดิมทั้งหมด ยังทำงานเหมือนเดิม) ---
  useEffect(() => { /* ... load product types ... */ }, [open]);
  useEffect(() => { /* ... auto-calculate priceThb ... */ }, [formData.priceYuan, formData.exchangeRate]);
  useEffect(() => { /* ... auto-calculate costThb ... */ }, [formData.priceThb, formData.importCost]);
  useEffect(() => { /* ... auto-generate SKU ... */ }, [selectedCategories, open, editingProduct, formData.sku]);

  // --- 4. useEffect สำหรับดึงข้อมูล Tag (เหมือนเดิม) ---
  useEffect(() => {
    const loadAllTags = async () => {
      const { data, error } = await supabase.from('tags').select('name');
      if (error) console.error("Error fetching tags", error);
      else setAllTags((data || []).map(tag => ({ value: tag.name, label: tag.name })));
    };

    if (open) {
      loadAllTags();
    }
    
    if (editingProduct) {
      setFormData(editingProduct);
      // (ส่วนโค้ดสำหรับ set options, images ของ editingProduct เหมือนเดิม)
      // ...
      
      const fetchProductTags = async () => {
        if (!editingProduct.id) return;
        const { data, error } = await supabase
          .from('product_tags')
          .select('tags(name)')
          .eq('product_id', editingProduct.id);
        
        if (error) console.error("Error fetching product tags", error);
        else {
          // @ts-ignore
          const currentTags = (data || []).map(pt => ({ value: pt.tags.name, label: pt.tags.name }));
          setSelectedTags(currentTags);
        }
      };
      fetchProductTags();

    } else {
      // Reset form (เหมือนเดิม)
      setFormData({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: ""});
      setSelectedCategories([]);
      setOptions([]);
      setProductImages([]);
      setSelectedTags([]); // Reset selected tags ด้วย
    }
  }, [editingProduct, open]);
  
  // (ฟังก์ชัน toggleCategory, handleImagesChange เหมือนเดิม)
  const toggleCategory = (category: string) => { /* ... */ };
  const handleImagesChange = (images: ProductImage[]) => { /* ... */ };

  // **เพิ่ม: ฟังก์ชันสำหรับจัดการ Tagging UI**
  const handleAddTag = () => {
    const newTagName = tagInput.trim();
    if (newTagName && !selectedTags.some(tag => tag.value === newTagName)) {
      setSelectedTags([...selectedTags, { value: newTagName, label: newTagName }]);
    }
    setTagInput(""); // Reset input field
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.value !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // ป้องกันการ submit form หลัก
      handleAddTag();
    }
  };


  const handleSubmit = async () => {
    // ... (ส่วนโค้ดข้างบนของ handleSubmit เหมือนเดิม) ...
    // คำนวณ quantity, images...

    const dataToSave = {
      ...formData,
      categories: selectedCategories,
      category: selectedCategories[0] || "",
      // quantity,
      options: options.length > 0 ? options : undefined,
      // images: uploadedImages,
      // --- 5. เพิ่มข้อมูล Tag ที่จะบันทึก (เหมือนเดิม) ---
      tags: selectedTags.map(tag => tag.value) // ส่งไปเป็น array ของชื่อ tag
    };

    try {
      await onAddProduct(dataToSave);
      onOpenChange(false);
      // ... (ส่วน reset form เหมือนเดิม) ...
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-purple-800">
              {editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            {/* ... ProductFormFields ... */}
            
            {/* --- 6. เปลี่ยนช่องจัดการ Tag ใหม่ทั้งหมด --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
                <p className="text-sm text-gray-500">
                  เพิ่ม Tag เพื่อช่วยในการค้นหา เช่น ชื่อตัวละคร, ชื่อซีรีส์
                </p>
              </CardHeader>
              <CardContent>
                {/* ส่วนแสดง Tag ที่เลือกแล้ว */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tag => (
                    <div key={tag.value} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                      <span>{tag.label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.value)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                        aria-label={`Remove ${tag.label}`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

                {/* ส่วน Input สำหรับเพิ่ม Tag ใหม่ */}
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="พิมพ์ Tag แล้วกด Enter เพื่อเพิ่ม"
                    list="all-tags-list" // เชื่อมกับ datalist
                    className="flex-grow"
                  />
                  {/* Datalist สำหรับ Autocomplete (ทำงานแบบ Native HTML) */}
                  <datalist id="all-tags-list">
                    {allTags
                        .filter(tag => !selectedTags.some(selected => selected.value === tag.value)) // กรอง Tag ที่ยังไม่ได้เลือก
                        .map(tag => <option key={tag.value} value={tag.value} />)
                    }
                  </datalist>

                  <Button type="button" onClick={handleAddTag}>
                    เพิ่ม
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* --- 7. เพิ่มช่องแสดง Slug (เหมือนเดิม) --- */}
            {editingProduct && formData.slug && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Product Slug</CardTitle>
                  <p className="text-sm text-gray-500">
                    นี่คือ URL ของสินค้า (สร้างโดยอัตโนมัติ)
                  </p>
                </CardHeader>
                <CardContent>
                  <Input value={formData.slug} readOnly className="bg-gray-100"/>
                </CardContent>
              </Card>
            )}

            {/* ... ProductCategorySelector และอื่นๆ เหมือนเดิม ... */}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                  ยกเลิก
              </Button>
              <Button onClick={handleSubmit}>
                  {editingProduct ? "บันทึกการเปลี่ยนแปลง" : "สร้างสินค้า"}
              </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProductTypeManagementModal open={showProductTypeModal} onOpenChange={setShowProductTypeModal} onProductTypeAdded={(newType) => setProductTypes([...productTypes, newType])} />
    </>
  );
};

export default AddProductModal;
