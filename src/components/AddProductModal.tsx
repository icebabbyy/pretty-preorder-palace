// src/components/AddProductModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
// --- 1. เพิ่ม Type 'Tag' เข้าไปใน import เดิม ---
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

// --- 2. Import เฉพาะสิ่งที่จำเป็นสำหรับ Tag ---
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: any) => void;
  categories: string[];
  editingProduct?: Product | null;
}

const AddProductModal = ({ open, onOpenChange, onAddProduct, categories, editingProduct }: AddProductModalProps) => {
  // --- State เดิมของคุณ (ไม่แก้ไข) ---
  const [formData, setFormData] = useState<Product>({
    sku: "", name: "", category: "", categories: [], productType: "", image: "",
    priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0,
    sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: ""
  });
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  // --- 3. เพิ่ม State สำหรับ Tag เท่านั้น ---
  const [allTags, setAllTags] = useState<{ value: string; label: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<{ value: string; label: string }[]>([]);
  const [tagInput, setTagInput] = useState("");

  // --- useEffect เดิมของคุณทั้งหมด (ไม่แก้ไข) ---
  useEffect(() => {
    if (open) {
      fetchProductTypes().then(setProductTypes).catch(console.error);
    }
  }, [open]);
  useEffect(() => { /* ... Auto-calculate ราคาบาท ... */ }, [formData.priceYuan, formData.exchangeRate]);
  useEffect(() => { /* ... Auto-calculate ต้นทุนรวม ... */ }, [formData.priceThb, formData.importCost]);
  useEffect(() => { /* ... Logic เดิมสำหรับ editingProduct ... */ }, [editingProduct, open]);
  useEffect(() => { /* ... Auto-generate SKU ... */ }, [selectedCategories, open, editingProduct, formData.sku]);
  
  // --- 4. สร้าง useEffect ใหม่สำหรับ Tag โดยเฉพาะ (ไม่ยุ่งกับของเดิม) ---
  useEffect(() => {
    if (!open) return;

    // ดึง Tag ทั้งหมดมาเพื่อใช้เป็น autocomplete
    const loadAllTags = async () => {
      const { data, error } = await supabase.from('tags').select('name');
      if (error) console.error("Error fetching all tags:", error);
      else setAllTags((data || []).map(tag => ({ value: tag.name, label: tag.name })));
    };
    loadAllTags();

    // ถ้าเป็นการแก้ไขสินค้า ให้ดึง Tag ของสินค้านั้นๆ
    if (editingProduct && editingProduct.id) {
      const fetchProductTags = async () => {
        const { data, error } = await supabase
          .from('product_tags')
          .select('tags(name)')
          .eq('product_id', editingProduct.id);
        
        if (error) {
          console.error("Error fetching product tags:", error);
          setSelectedTags([]);
        } else {
          const currentTags = (data || [])
            // @ts-ignore
            .map(pt => pt.tags ? { value: pt.tags.name, label: pt.tags.name } : null)
            .filter(Boolean) as { value: string; label: string }[];
          setSelectedTags(currentTags);
        }
      };
      fetchProductTags();
    } else {
      // ถ้าเป็นการสร้างสินค้าใหม่ ให้เคลียร์ Tag ที่เลือกไว้
      setSelectedTags([]);
      setTagInput("");
    }
  }, [open, editingProduct]);


  // --- ฟังก์ชัน Helper เดิม (ไม่แก้ไข) ---
  const toggleCategory = (category: string) => { /* ...โค้ดเดิม... */ };
  const handleImagesChange = (images: ProductImage[]) => { /* ...โค้ดเดิม... */ };

  // --- 5. แก้ไข handleSubmit โดยเพิ่มข้อมูล Tag เข้าไปเท่านั้น ---
  const handleSubmit = async () => {
    if (!formData.name || selectedCategories.length === 0) {
      alert("กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่");
      return;
    }
    let quantity = formData.quantity;
    if (options.length > 0) { quantity = options.reduce((sum, o) => sum + (o.quantity || 0), 0); }
    const productId = editingProduct?.id || Date.now();
    const uploadedImages: ProductImage[] = [];
    for (let i = 0; i < productImages.length; i++) { /* ...โค้ดเดิม... */ }

    const dataToSave = {
      ...formData,
      categories: selectedCategories,
      category: selectedCategories[0],
      quantity,
      options: options.length > 0 ? options : undefined,
      images: uploadedImages,
      // เพิ่มบรรทัดนี้บรรทัดเดียว
      tags: selectedTags.map(tag => tag.value),
    };

    try {
      await onAddProduct(dataToSave);
      onOpenChange(false);
      if (!editingProduct) { /* ...โค้ดเดิม... */ }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกสินค้า");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* 6. ปรับความกว้างของ Modal ที่นี่ */}
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-purple-800">
              {editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {/* Component เดิมของคุณ */}
            <ProductFormFields
              formData={formData}
              setFormData={setFormData}
              productTypes={productTypes}
              onShowProductTypeModal={() => setShowProductTypeModal(true)}
            />

            {/* --- 7. แทรก UI ของ Tag เข้ามาตรงนี้ --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
                <p className="text-sm text-gray-500">
                  เพิ่ม Tag เพื่อช่วยในการค้นหา เช่น ชื่อตัวละคร, ชื่อซีรีส์ (กด Enter เพื่อเพิ่ม)
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map(tag => (
                    <div key={tag.value} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-800 animate-in fade-in-50">
                      <span>{tag.label}</span>
                      <button type="button" onClick={() => setSelectedTags(selectedTags.filter(t => t.value !== tag.value))} className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none">&times;</button>
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
                        if (newTagName && !selectedTags.some(tag => tag.value.toLowerCase() === newTagName.toLowerCase())) {
                          setSelectedTags([...selectedTags, { value: newTagName, label: newTagName }]);
                        }
                        setTagInput("");
                      }
                    }}
                    placeholder="พิมพ์ชื่อ Tag..."
                    list="all-tags-list"
                  />
                  <datalist id="all-tags-list">
                    {allTags
                        .filter(tag => !selectedTags.some(selected => selected.value.toLowerCase() === tag.value.toLowerCase()))
                        .map(tag => <option key={tag.value} value={tag.value} />)
                    }
                  </datalist>
                  <Button type="button" onClick={() => {
                      const newTagName = tagInput.trim();
                      if (newTagName && !selectedTags.some(tag => tag.value.toLowerCase() === newTagName.toLowerCase())) {
                          setSelectedTags([...selectedTags, { value: newTagName, label: newTagName }]);
                      }
                      setTagInput("");
                  }}>
                    เพิ่ม Tag
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Component เดิมของคุณ */}
            <ProductCategorySelector /* ...props... */ />
            <ProductImageManager /* ...props... */ />
            <ProductPricingFields /* ...props... */ />
            <ProductOptionsManager /* ...props... */ />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-purple-200">
            {/* ...Buttons เดิมของคุณ... */}
          </div>
        </DialogContent>
      </Dialog>
      <ProductTypeManagementModal /* ...props... */ />
    </>
  );
};

export default AddProductModal;
