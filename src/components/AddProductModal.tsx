// src/components/AddProductModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import { Product, ProductOption, ProductImage, Tag } from "@/types"; // --- [เพิ่มใหม่] เพิ่ม Type 'Tag' ---
import { generateSKU } from "@/utils/sku";
import { fetchProductTypes } from "@/utils/productTypes";
import { fetchProductImages, uploadImageToStorage } from "@/utils/productImages";
import ProductTypeManagementModal from "./ProductTypeManagementModal";
import ProductImageManager from "./ProductImageManager";
import ProductFormFields from "./product-form/ProductFormFields";
import ProductCategorySelector from "./product-form/ProductCategorySelector";
import ProductPricingFields from "./product-form/ProductPricingFields";
import ProductOptionsManager from "./product-form/ProductOptionsManager";

// --- [เพิ่มใหม่] Import สิ่งที่จำเป็นสำหรับ Tags ---
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
  // --- State เดิมของคุณยังอยู่ครบ ---
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

  // --- [เพิ่มใหม่] State สำหรับจัดการ Tags ---
  const [allTags, setAllTags] = useState<{ value: string; label: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<{ value: string; label: string }[]>([]);
  const [tagInput, setTagInput] = useState("");


  // --- useEffect เดิมของคุณทั้งหมด ยังอยู่ครบถ้วน ---
  useEffect(() => { /* Load product types */ }, [open]);
  useEffect(() => { /* Auto-calculate ราคาบาท (THB) */ }, [formData.priceYuan, formData.exchangeRate]);
  useEffect(() => { /* Auto-calculate ต้นทุนรวม (costThb) */ }, [formData.priceThb, formData.importCost]);
  useEffect(() => { /* Auto-generate SKU */ }, [selectedCategories, open, editingProduct, formData.sku]);
  
  // --- ผสาน Logic การดึงข้อมูล Tag เข้ากับ useEffect เดิมของคุณ ---
  useEffect(() => {
    // --- [เพิ่มใหม่] Logic ดึง Tag ทั้งหมดเมื่อ Modal เปิด ---
    const loadAllTags = async () => {
      const { data, error } = await supabase.from('tags').select('name');
      if (error) console.error("Error fetching tags", error);
      else setAllTags((data || []).map(tag => ({ value: tag.name, label: tag.name })));
    };
    if (open) {
      loadAllTags();
    }

    // --- Logic เดิมของคุณสำหรับการแก้ไข/เพิ่มสินค้า ---
    if (editingProduct) {
      setFormData(editingProduct);
      setSelectedCategories(editingProduct.categories || [editingProduct.category].filter(Boolean));
      if (editingProduct.options) {
        setOptions(editingProduct.options.map(opt => ({ ...opt, id: opt.id || nanoid() })));
      } else {
        setOptions([]);
      }
      
      if (editingProduct.id) {
        fetchProductImages(editingProduct.id).then(images => {
          setProductImages(images);
          if (images.length > 0) {
            setFormData(prev => ({ ...prev, image: images[0].image_url }));
          }
        }).catch(console.error);
        
        // --- [เพิ่มใหม่] Logic ดึง Tag ของสินค้าที่กำลังแก้ไข ---
        const fetchProductTags = async () => {
          const { data, error } = await supabase
            .from('product_tags')
            .select('tags(name)')
            .eq('product_id', editingProduct.id);
          
          if (error) {
            console.error("Error fetching product tags", error);
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
        setProductImages([]);
      }
    } else { // --- Logic เดิมสำหรับการ Reset ฟอร์ม ---
      setFormData({
        sku: "", name: "", category: "", categories: [], productType: "", image: "",
        priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0,
        sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: ""
      });
      setSelectedCategories([]);
      setOptions([]);
      setProductImages([]);
      // --- [เพิ่มใหม่] Reset Tag State ด้วย ---
      setSelectedTags([]);
      setTagInput("");
    }
  }, [editingProduct, open]);

  // --- ฟังก์ชัน Helper เดิมของคุณ toggleCategory, handleImagesChange ---
  const toggleCategory = (category: string) => { /* ... โค้ดเดิม ... */ };
  const handleImagesChange = (images: ProductImage[]) => { /* ... โค้ดเดิม ... */ };

  // --- ฟังก์ชัน handleSubmit (ผสานข้อมูล Tags เข้าไป) ---
  const handleSubmit = async () => {
    if (!formData.name || selectedCategories.length === 0) { /* ... โค้ดเดิม ... */ return; }
    let quantity = formData.quantity;
    if (options.length > 0) { quantity = options.reduce((sum, o) => sum + (o.quantity || 0), 0); }
    const productId = editingProduct?.id || Date.now();
    const uploadedImages: ProductImage[] = [];
    for (let i = 0; i < productImages.length; i++) { /* ... โค้ดเดิม ... */ }

    const dataToSave = {
      ...formData,
      categories: selectedCategories,
      category: selectedCategories[0],
      quantity,
      options: options.length > 0 ? options : undefined,
      images: uploadedImages,
      // --- [เพิ่มใหม่] เพิ่มข้อมูล Tags เข้าไปใน object ที่จะบันทึก ---
      tags: selectedTags.map(tag => tag.value),
    };

    try {
      await onAddProduct(dataToSave);
      onOpenChange(false);
      if (!editingProduct) { /* ... โค้ดเดิม ... */ }
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

          {/* --- JSX ส่วนแสดงผลหลัก (คงของเดิมไว้ทั้งหมด และเพิ่ม Card สำหรับ Tag) --- */}
          <div className="space-y-4 mt-6">
            <ProductFormFields
              formData={formData}
              setFormData={setFormData}
              productTypes={productTypes}
              onShowProductTypeModal={() => setShowProductTypeModal(true)}
            />

            {/* --- [เพิ่มใหม่] UI สำหรับจัดการ Tags --- */}
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
                        onClick={() => setSelectedTags(selectedTags.filter(t => t.value !== tag.value))}
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

            <ProductCategorySelector
              categories={categories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
            />
            <ProductImageManager
              productId={editingProduct?.id}
              images={productImages}
              onImagesChange={handleImagesChange}
              disabled={false}
              productOptions={options}
            />
            <ProductPricingFields
              formData={formData}
              setFormData={setFormData}
            />
            <ProductOptionsManager
              options={options}
              setOptions={setOptions}
              category={formData.category}
              editingProductId={editingProduct?.id}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-purple-200">
            { /* ... Buttons ... */ }
          </div>
        </DialogContent>
      </Dialog>
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
