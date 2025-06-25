// src/app/admin/products/AddProductModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import { Product, ProductOption, ProductImage } from "@/types";
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
  const [formData, setFormData] = useState<Product>({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "", quantity: 0 });
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingProduct) {
        setFormData({ ...editingProduct, quantity: editingProduct.quantity || 0 });
        setSelectedCategories(editingProduct.categories || []);
        setOptions(editingProduct.options?.map(opt => ({ ...opt, id: opt.id || nanoid() })) || []);
        
        if (editingProduct.id) {
          fetchProductImages(editingProduct.id).then(setProductImages).catch(console.error);
          const fetchProductTags = async () => {
            const { data } = await supabase.from('product_tags').select('tags(name)').eq('product_id', editingProduct.id);
            setSelectedTags((data || []).map((pt: any) => pt.tags?.name).filter(Boolean));
          };
          fetchProductTags();
        }
      } else {
        setFormData({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "", quantity: 0 });
        setSelectedCategories([]);
        setOptions([]);
        setProductImages([]);
        setSelectedTags([]);
        setTagInput("");
      }
      fetchProductTypes().then(setProductTypes).catch(console.error);
    }
  }, [editingProduct, open]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, categories: selectedCategories, category: selectedCategories[0] || "" }));
    if (!editingProduct && !formData.sku && selectedCategories.length > 0) {
      setFormData(prev => ({ ...prev, sku: generateSKU(selectedCategories[0]) }));
    }
  }, [selectedCategories]);
// src/app/admin/products/AddProductModal.tsx

  // --- useEffect สำหรับคำนวณราคา (เวอร์ชันใหม่ที่รวมทุกอย่าง) ---
  useEffect(() => {
    const yuan = parseFloat(String(formData.priceYuan)) || 0;
    const rate = parseFloat(String(formData.exchangeRate)) || 0;
    const importFee = parseFloat(String(formData.importCost)) || 0;

    const newPriceThb = (yuan > 0 && rate > 0) ? parseFloat((yuan * rate).toFixed(2)) : 0;
    const newCostThb = newPriceThb + importFee;

    // อัปเดต state ด้วยค่าที่คำนวณใหม่ทั้งสองค่าในครั้งเดียว
    setFormData(prev => {
      // เช็คก่อนว่าค่ามีการเปลี่ยนแปลงจริงหรือไม่ เพื่อป้องกันการ re-render ไม่สิ้นสุด
      if (prev.priceThb !== newPriceThb || prev.costThb !== newCostThb) {
        return {
          ...prev,
          priceThb: newPriceThb,
          costThb: newCostThb,
        };
      }
      return prev;
    });

  }, [formData.priceYuan, formData.exchangeRate, formData.importCost]); // ดักจับการเปลี่ยนแปลงจาก input ทั้ง 3 ตัว
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const handleImagesChange = (images: ProductImage[]) => {
    setProductImages(images);
    const mainImage = images.find(img => img.order === 1);
    setFormData(prev => ({ ...prev, image: mainImage ? mainImage.image_url : (images[0]?.image_url || "") }));
  };

  const handleSubmit = async () => {
    if (!formData.name || selectedCategories.length === 0) {
      alert("กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่"); return;
    }
    
    setIsSubmitting(true);
    try {
      const uploadedImagePromises = productImages.map(async (image) => {
        if (image.file) {
          const newUrl = await uploadImageToStorage(image.file, String(editingProduct?.id || nanoid()), "products");
          const { file, ...rest } = image;
          return { ...rest, image_url: newUrl };
        }
        return image;
      });
      const uploadedImages = await Promise.all(uploadedImagePromises);

      const quantity = options.length > 0 ? options.reduce((sum, o) => sum + (o.quantity || 0), 0) : (formData.quantity || 0);
      const dataToSave = {
        ...formData,
        quantity,
        options: options.length > 0 ? options : undefined,
        images: uploadedImages,
        tags: selectedTags,
      };
      
      await onAddProduct(dataToSave);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกสินค้า: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-xl">{editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</DialogTitle></DialogHeader>
        <div className="space-y-6 py-4">
          <ProductFormFields formData={formData} setFormData={setFormData} productTypes={productTypes} onShowProductTypeModal={() => setShowProductTypeModal(true)} />
          <ProductCategorySelector categories={categories} selectedCategories={selectedCategories} toggleCategory={toggleCategory} />
          <Card><CardHeader><CardTitle className="text-base">Tags</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2 mb-3 min-h-[2.5rem]">{selectedTags.map(tag => (<div key={tag} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium"><span>{tag}</span><button type="button" onClick={() => setSelectedTags(current => current.filter(t => t !== tag))} className="ml-2 text-gray-500 hover:text-gray-700">&times;</button></div>))}</div><div className="flex items-center gap-2"><Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => {if (e.key === 'Enter') { e.preventDefault(); const newTag = tagInput.trim(); if (newTag && !selectedTags.find(t => t.toLowerCase() === newTag.toLowerCase())) { setSelectedTags(curr => [...curr, newTag]); } setTagInput(""); }}} placeholder="พิมพ์ Tag แล้วกด Enter..." /><Button type="button" onClick={() => { const newTag = tagInput.trim(); if (newTag && !selectedTags.find(t => t.toLowerCase() === newTag.toLowerCase())) { setSelectedTags(curr => [...curr, newTag]); } setTagInput(""); }}>เพิ่ม</Button></div></CardContent></Card>
          <ProductImageManager productId={editingProduct?.id ? String(editingProduct.id) : undefined} images={productImages} onImagesChange={handleImagesChange} disabled={isSubmitting} productOptions={options} />
          <ProductPricingFields formData={formData} setFormData={setFormData} />
          <ProductOptionsManager options={options} setOptions={setOptions} productFormData={formData} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>ยกเลิก</Button>
          <Button onClick={handleSubmit} disabled={!formData.name || selectedCategories.length === 0 || isSubmitting}>{isSubmitting ? "กำลังบันทึก..." : "บันทึก"}</Button>
        </div>
      </DialogContent>
      <ProductTypeManagementModal open={showProductTypeModal} onOpenChange={setShowProductTypeModal} productTypes={productTypes} setProductTypes={setProductTypes} />
    </Dialog>
  );
};

export default AddProductModal;
