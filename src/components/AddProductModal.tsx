// src/app/admin/products/AddProductModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  // --- State เดิมทั้งหมด (ไม่แก้ไข) ---
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

  // --- State สำหรับ Tag (เอาออกหมดเหลือแค่ 2 อันนี้) ---
  const [selectedTags, setSelectedTags] = useState<{ value: string; label: string }[]>([]);
  const [tagInput, setTagInput] = useState("");

  // --- useEffect ทั้งหมดของคุณ (ไม่แก้ไข) ---
  useEffect(() => { if (open) { fetchProductTypes().then(setProductTypes).catch(console.error); } }, [open]);
  useEffect(() => { /* ...คำนวณราคา... */ }, [formData.priceYuan, formData.exchangeRate]);
  useEffect(() => { /* ...คำนวณต้นทุน... */ }, [formData.priceThb, formData.importCost]);
  useEffect(() => { /* ...สร้าง SKU... */ }, [selectedCategories, open, editingProduct, formData.sku]);

  // --- useEffect หลัก (ลดทอนให้เหลือแค่ดึง Tag ของสินค้าที่แก้) ---
  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
      setSelectedCategories(editingProduct.categories || [editingProduct.category].filter(Boolean));
      setOptions(editingProduct.options?.map(opt => ({ ...opt, id: opt.id || nanoid() })) || []);
      
      if (editingProduct.id) {
        fetchProductImages(editingProduct.id).then(images => {
          setProductImages(images);
          if (images.length > 0) setFormData(prev => ({ ...prev, image: images[0].image_url }));
        }).catch(console.error);

        // ดึง Tag ของสินค้านี้เท่านั้น
        const fetchProductTags = async () => {
          const { data, error } = await supabase.from('product_tags').select('tags(name)').eq('product_id', editingProduct.id);
          if (error) {
            console.error("Error fetching product tags:", error);
            setSelectedTags([]);
          } else {
            // @ts-ignore
            const currentTags = (data || []).map(pt => pt.tags ? { value: pt.tags.name, label: pt.tags.name } : null).filter(Boolean);
            setSelectedTags(currentTags);
          }
        };
        fetchProductTags();
      } else {
        setProductImages([]);
        setSelectedTags([]);
      }
    } else {
      // --- Logic Reset เดิม (เพิ่มแค่ reset tag) ---
      setFormData({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "" });
      setSelectedCategories([]);
      setOptions([]);
      setProductImages([]);
      setSelectedTags([]);
      setTagInput("");
    }
  }, [editingProduct, open]);

  // --- ฟังก์ชัน Helper เดิม (ไม่แก้ไข) ---
  const toggleCategory = (category: string) => { /* ...โค้ดเดิม... */ };
  const handleImagesChange = (images: ProductImage[]) => { /* ...โค้ดเดิม... */ };

  // --- ฟังก์ชัน handleSubmit (แก้ไขเฉพาะการส่ง Tag) ---
  const handleSubmit = async () => {
    if (!formData.name || selectedCategories.length === 0) { /* ...โค้ดเดิม... */ return; }
    let quantity = formData.quantity;
    if (options.length > 0) { quantity = options.reduce((sum, o) => sum + (o.quantity || 0), 0); }
    const productId = editingProduct?.id || nanoid();
    // ... logic upload image เดิม ...
    const uploadedImages: ProductImage[] = [];
     for (let i = 0; i < productImages.length; i++) {
       const img = productImages[i];
       if (img.file) {
         const folder = i === 0 ? "main" : "extra";
         const url = await uploadImageToStorage(img.file, productId.toString(), folder);
         if (url) {
           const { file, ...rest } = img;
           uploadedImages.push({ ...rest, image_url: url });
         }
       } else {
         uploadedImages.push(img);
       }
     }

    const dataToSave = {
      ...formData,
      categories: selectedCategories,
      category: selectedCategories[0],
      quantity,
      // **ใช้ logic options เดิมของคุณ**
      options: options.length > 0 ? options : undefined,
      images: uploadedImages,
      // เพิ่มแค่บรรทัดนี้
      tags: selectedTags.map(tag => tag.value),
    };
    try {
      await onAddProduct(dataToSave);
      onOpenChange(false);
    } catch (error) { console.error("Error saving product:", error); alert("เกิดข้อผิดพลาดในการบันทึกสินค้า"); }
  };
  
  // ฟังก์ชันสำหรับเพิ่ม Tag (แบบง่ายที่สุด)
  const handleAddTag = () => {
    const newTagName = tagInput.trim();
    if (newTagName && !selectedTags.some(t => t.value.toLowerCase() === newTagName.toLowerCase())) {
        setSelectedTags([...selectedTags, { value: newTagName, label: newTagName }]);
    }
    setTagInput("");
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
          <DialogHeader><DialogTitle className="text-xl text-purple-800">{editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-6">
            <ProductFormFields formData={formData} setFormData={setFormData} productTypes={productTypes} onShowProductTypeModal={() => setShowProductTypeModal(true)} />

            {/* --- UI ของ Tag (แบบ Minimal ที่สุด) --- */}
            <Card>
              <CardHeader><CardTitle className="text-base">Tags</CardTitle><p className="text-sm text-gray-500">เพิ่ม Tag เพื่อช่วยในการค้นหา (กด Enter เพื่อเพิ่ม)</p></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map(tag => (
                    <div key={tag.value} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                      <span>{tag.label}</span>
                      <button type="button" onClick={() => setSelectedTags(selectedTags.filter(t => t.value !== tag.value))} className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none">&times;</button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="พิมพ์ชื่อ Tag..." />
                  <Button type="button" onClick={handleAddTag}>เพิ่ม Tag</Button>
                </div>
              </CardContent>
            </Card>

            {/* --- Component เดิมของคุณทั้งหมด --- */}
            <ProductCategorySelector categories={categories} selectedCategories={selectedCategories} toggleCategory={toggleCategory} />
            <ProductImageManager productId={editingProduct?.id?.toString()} images={productImages} onImagesChange={handleImagesChange} disabled={false} productOptions={options} />
            <ProductPricingFields formData={formData} setFormData={setFormData} />
            <ProductOptionsManager options={options} setOptions={setOptions} category={formData.category} editingProductId={editingProduct?.id} />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-purple-200">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg">ยกเลิก</Button>
            <Button onClick={handleSubmit} className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg" disabled={!formData.name || selectedCategories.length === 0}>{editingProduct ? "บันทึกการแก้ไข" : "บันทึก"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <ProductTypeManagementModal open={showProductTypeModal} onOpenChange={setShowProductTypeModal} productTypes={productTypes} setProductTypes={setProductTypes} />
    </>
  );
};

export default AddProductModal;
