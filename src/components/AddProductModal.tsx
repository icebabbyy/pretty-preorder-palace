// src/components/AddProductModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { nanoid } from "nanoid";
import { Product, ProductOption, ProductImage, Tag } from "@/types";
import { generateSKU } from "@/utils/sku";
import { fetchProductTypes } from "@/utils/productTypes";
import { fetchProductImages, uploadImageToStorage } from "@/utils/productImages";
import ProductTypeManagementModal from "./ProductTypeManagementModal";
import ProductImageManager from "./ProductImageManager";
import ProductFormFields from "./product-form/ProductFormFields";
import ProductCategorySelector from "./product-form/ProductCategorySelector";
import ProductPricingFields from "./product-form/ProductPricingFields";
import ProductOptionsManager from "./product-form/ProductOptionsManager";
import { supabase } from "@/integrations/supabase/client";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: any) => void;
  categories: string[];
  editingProduct?: Product | null;
}

const AddProductModal = ({ open, onOpenChange, onAddProduct, categories, editingProduct }: AddProductModalProps) => {
  // --- State ทั้งหมดเหมือนเดิม ---
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
  const [allTags, setAllTags] = useState<{ value: string; label: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<{ value: string; label: string }[]>([]);
  const [tagInput, setTagInput] = useState("");

  // --- useEffect ที่คำนวณต่างๆ ยังเหมือนเดิม ---
  useEffect(() => { /* ... load product types ... */ }, [open]);
  useEffect(() => { /* ... auto-calculate priceThb ... */ }, [formData.priceYuan, formData.exchangeRate]);
  useEffect(() => { /* ... auto-calculate costThb ... */ }, [formData.priceThb, formData.importCost]);
  useEffect(() => { /* ... auto-generate SKU ... */ }, [selectedCategories, open, editingProduct, formData.sku]);

  // --- 4. useEffect หลัก (***แก้ไขจุดนี้เป็นหลัก***) ---
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
      // --- FIX 1: ตั้งค่า State ทั้งหมดให้ครบถ้วนเมื่อแก้ไขสินค้า ---
      // ใช้ `|| []` เพื่อป้องกันค่า undefined ซึ่งเป็นสาเหตุของบั๊ก
      setFormData(editingProduct);
      setOptions(editingProduct.options || []);
      setSelectedCategories(editingProduct.categories || []);
      setProductImages(editingProduct.images || []);
      
      const fetchProductTags = async () => {
        if (!editingProduct.id) return;
        const { data, error } = await supabase
          .from('product_tags')
          .select('tags(name)')
          .eq('product_id', editingProduct.id);
        
        if (error) {
            console.error("Error fetching product tags", error);
        } else {
          // --- FIX 2: เพิ่มการป้องกันข้อมูล tags เป็น null ---
          const currentTags = (data || [])
            // @ts-ignore
            .map(pt => pt.tags ? { value: pt.tags.name, label: pt.tags.name } : null)
            .filter(Boolean) as { value: string; label: string }[];
          setSelectedTags(currentTags);
        }
      };
      fetchProductTags();

    } else {
      // Reset form เมื่อเป็นการ "เพิ่มสินค้าใหม่" (ส่วนนี้ถูกต้องอยู่แล้ว)
      setFormData({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: ""});
      setSelectedCategories([]);
      setOptions([]);
      setProductImages([]);
      setSelectedTags([]);
      setTagInput("");
    }
  }, [editingProduct, open]);
  
  // --- ฟังก์ชันจัดการอื่นๆ เหมือนเดิม ---
  const toggleCategory = (category: string) => { /* ... */ };
  const handleImagesChange = (images: ProductImage[]) => { setProductImages(images) };
  const handleAddTag = () => { /* ... */ };
  const handleRemoveTag = (tagToRemove: string) => { /* ... */ };
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { /* ... */ };


  const handleSubmit = async () => {
    // หมายเหตุ: ส่วนคำนวณ quantity และ images ควรจะมี logic ของคุณอยู่ตรงนี้
    // เช่น const quantity = options.reduce(...);
    // const uploadedImages = await uploadImages(...);

    const dataToSave = {
      ...formData,
      categories: selectedCategories,
      category: selectedCategories[0] || "",
      // quantity: quantity, // หากมีตัวแปร quantity ให้ใส่กลับเข้ามา
      options: options.length > 0 ? options : undefined,
      images: productImages, // ใช้ State productImages
      tags: selectedTags.map(tag => tag.value)
    };

    try {
      await onAddProduct(dataToSave);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  // --- ส่วน JSX สำหรับ Render (เหมือนเดิม แต่ตอนนี้ควรจะปลอดภัยแล้ว) ---
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* ... Header ... */}
          <DialogHeader>
            <DialogTitle className="text-xl text-purple-800">
              {editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}
            </DialogTitle>
          </DialogHeader>

          {/* ... Form Body ... */}
          <div className="space-y-4 mt-6">
            
            {/* --- Tag Management UI (เหมือนเดิม) --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
                <p className="text-sm text-gray-500">
                  เพิ่ม Tag เพื่อช่วยในการค้นหา เช่น ชื่อตัวละคร, ชื่อซีรีส์
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tag => (
                    <div key={tag.value} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                      <span>{tag.label}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTags(selectedTags.filter(t => t.value !== tag.value))}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >&times;</button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newTagName = tagInput.trim();
                        if (newTagName && !selectedTags.some(tag => tag.value === newTagName)) {
                          setSelectedTags([...selectedTags, { value: newTagName, label: newTagName }]);
                        }
                        setTagInput("");
                      }
                    }}
                    placeholder="พิมพ์ Tag แล้วกด Enter เพื่อเพิ่ม"
                    list="all-tags-list"
                  />
                   <datalist id="all-tags-list">
                    {allTags
                        .filter(tag => !selectedTags.some(selected => selected.value === tag.value))
                        .map(tag => <option key={tag.value} value={tag.value} />)
                    }
                  </datalist>
                  <Button type="button" onClick={() => {
                      const newTagName = tagInput.trim();
                      if (newTagName && !selectedTags.some(tag => tag.value === newTagName)) {
                          setSelectedTags([...selectedTags, { value: newTagName, label: newTagName }]);
                      }
                      setTagInput("");
                  }}>
                    เพิ่ม
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ... Other form components ... */}

          </div>
          
          {/* ... Footer Buttons ... */}
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
      {/* ... Other Modals ... */}
    </>
  );
};

export default AddProductModal;
