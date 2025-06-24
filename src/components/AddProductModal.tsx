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
  const [formData, setFormData] = useState<Product>({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "" });
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open) {
      fetchProductTypes().then(setProductTypes).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
      setSelectedCategories(editingProduct.categories || []);
      setOptions(editingProduct.options || []);
      setProductImages(editingProduct.images || []);
      
      // ดึง Tag ของสินค้า
      if (editingProduct.id) {
        const fetchProductTags = async () => {
          const { data } = await supabase.from('product_tags').select('tags(name)').eq('product_id', editingProduct.id);
          // @ts-ignore
          setSelectedTags((data || []).map(pt => pt.tags?.name).filter(Boolean));
        };
        fetchProductTags();
      }
    } else {
      // Reset form
      setFormData({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "" });
      setSelectedCategories([]);
      setOptions([]);
      setProductImages([]);
      setSelectedTags([]);
      setTagInput("");
    }
  }, [editingProduct, open]);
  
  // --- แก้ปัญหาเลือก Category ไม่ได้ ---
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };
  useEffect(() => {
    setFormData(prev => ({ ...prev, categories: selectedCategories, category: selectedCategories[0] || "" }));
    if (!editingProduct && (!formData.sku || formData.sku === "")) {
      if (selectedCategories.length > 0) {
        setFormData(prev => ({ ...prev, sku: generateSKU(selectedCategories[0]) }));
      }
    }
  }, [selectedCategories]);
  // --- จบส่วนแก้ปัญหา Category ---

  const handleImagesChange = (images: ProductImage[]) => {
    setProductImages(images);
    setFormData(prev => ({ ...prev, image: images.length > 0 ? images[0].image_url : "" }));
  };

  const handleSubmit = async () => {
    if (!formData.name || selectedCategories.length === 0) {
      alert("กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่");
      return;
    }
    const dataToSave = {
      ...formData,
      images: productImages,
      options: options,
      tags: selectedTags
    };
    await onAddProduct(dataToSave);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl">{editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <ProductFormFields formData={formData} setFormData={setFormData} productTypes={productTypes} onShowProductTypeModal={() => setShowProductTypeModal(true)} />
            
            <ProductCategorySelector categories={categories} selectedCategories={selectedCategories} toggleCategory={toggleCategory} />
            
            {/* TAGS UI */}
            <div className="p-4 border rounded-lg bg-gray-50/50">
              <h3 className="text-base font-semibold mb-2 text-gray-800">Tags</h3>
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
                      if (newTag && !selectedTags.includes(newTag)) setSelectedTags(curr => [...curr, newTag]);
                      setTagInput("");
                    }
                  }} placeholder="พิมพ์ Tag แล้วกด Enter..."
                />
                <Button type="button" onClick={() => {
                  const newTag = tagInput.trim();
                  if (newTag && !selectedTags.includes(newTag)) setSelectedTags(curr => [...curr, newTag]);
                  setTagInput("");
                }}>เพิ่ม</Button>
              </div>
            </div>

            <ProductImageManager productId={editingProduct?.id} images={productImages} onImagesChange={handleImagesChange} disabled={false} productOptions={options} />
            <ProductPricingFields formData={formData} setFormData={setFormData} />
            <ProductOptionsManager options={options} setOptions={setOptions} productFormData={formData} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
            <Button onClick={handleSubmit}>บันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>
      <ProductTypeManagementModal open={showProductTypeModal} onOpenChange={setShowProductTypeModal} productTypes={productTypes} setProductTypes={setProductTypes} />
    </>
  );
};

export default AddProductModal;
