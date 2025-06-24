// src/app/admin/products/AddProductModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
// B1: เพิ่ม Type 'Tag' เข้าไปใน import เดิม (ตอนนี้มันจะหาเจอแล้ว)
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

// B1: Import เพิ่มเฉพาะสิ่งที่จำเป็นสำหรับ Tag
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

  // --- B2: เพิ่ม State สำหรับ Tag เท่านั้น ---
  const [allTags, setAllTags] = useState<{ value: string; label: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<{ value: string; label: string }[]>([]);
  const [tagInput, setTagInput] = useState("");

  // --- useEffect เดิมของคุณ: ดึง Product Types ---
  useEffect(() => {
    if (open) {
      fetchProductTypes().then(setProductTypes).catch(console.error);

      // --- B3: เพิ่มการดึง Tag ทั้งหมดมาไว้ใน Hook นี้ ---
      const loadAllTags = async () => {
        const { data, error } = await supabase.from('tags').select('name');
        if (error) console.error("Error fetching all tags:", error);
        else setAllTags((data || []).map(tag => ({ value: tag.name, label: tag.name })));
      };
      loadAllTags();
    }
  }, [open]);

  // --- useEffect เดิมของคุณ (ไม่แก้ไข) ---
  useEffect(() => {
    const y = parseFloat(formData.priceYuan as any) || 0;
    const r = parseFloat(formData.exchangeRate as any) || 0;
    if (y > 0 && r > 0) {
      setFormData(prev => ({ ...prev, priceThb: parseFloat((y * r).toFixed(2)) }));
    } else {
      setFormData(prev => ({ ...prev, priceThb: 0 }));
    }
  }, [formData.priceYuan, formData.exchangeRate]);
  useEffect(() => {
    const totalCost = (parseFloat(formData.priceThb as any) || 0) + (parseFloat(formData.importCost as any) || 0);
    setFormData(prev => ({ ...prev, costThb: totalCost }));
  }, [formData.priceThb, formData.importCost]);
  useEffect(() => {
    if (!editingProduct && (!formData.sku || formData.sku === "")) {
      if (selectedCategories.length > 0) {
        setFormData(prev => ({ ...prev, sku: generateSKU(selectedCategories[0]) }));
      }
    }
  }, [selectedCategories, open, editingProduct, formData.sku]);

  // --- useEffect เดิมของคุณ: จัดการข้อมูลตอน Edit/Reset ---
  useEffect(() => {
    if (editingProduct) {
      // --- Logic เดิมของคุณทั้งหมด (ไม่แก้ไข) ---
      setFormData(editingProduct);
      setSelectedCategories(editingProduct.categories || [editingProduct.category].filter(Boolean));
      setOptions(editingProduct.options?.map(opt => ({ ...opt, id: opt.id || nanoid() })) || []);
      if (editingProduct.id) {
        fetchProductImages(editingProduct.id).then(images => {
          setProductImages(images);
          if (images.length > 0) {
            setFormData(prev => ({ ...prev, image: images[0].image_url }));
          }
        }).catch(console.error);

        // --- B4: เพิ่มการดึง Tag ของสินค้าชิ้นนี้ ต่อท้าย logic เดิม ---
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
        setSelectedTags([]); // เคลียร์ tag ถ้าไม่มี id
      }
    } else {
      // --- Logic เดิมของคุณสำหรับ Reset ฟอร์ม (ไม่แก้ไข) ---
      setFormData({ sku: "", name: "", category: "", categories: [], productType: "", image: "", priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0, sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "" });
      setSelectedCategories([]);
      setOptions([]);
      setProductImages([]);
      // --- B5: เพิ่มการ Reset State ของ Tag เข้าไปในส่วนนี้ ---
      setSelectedTags([]);
      setTagInput("");
    }
  }, [editingProduct, open]);

  // --- ฟังก์ชัน Helper เดิม (ไม่แก้ไข) ---
  const toggleCategory = (category: string) => { /* ...โค้ดเดิม... */ };
  const handleImagesChange = (images: ProductImage[]) => { /* ...โค้ดเดิม... */ };

  // --- B6: แก้ไข handleSubmit โดยเพิ่มข้อมูล Tag เข้าไปเท่านั้น ---
  const handleSubmit = async () => {
    if (!formData.name || selectedCategories.length === 0) { alert("กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่"); return; }
    let quantity = formData.quantity;
    if (options.length > 0) { quantity = options.reduce((sum, o) => sum + (o.quantity || 0), 0); }
    const productId = editingProduct?.id || nanoid();
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
      options: options.length > 0 ? options.map(({ id, ...rest }) => (id && id.length < 20) ? { id, ...rest } : rest) : undefined,
      images: uploadedImages,
      tags: selectedTags.map(tag => tag.value),
    };
    try {
      await onAddProduct(dataToSave);
      onOpenChange(false);
    } catch (error) { console.error("Error saving product:", error); alert("เกิดข้อผิดพลาดในการบันทึกสินค้า"); }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border border-purple-200 rounded-xl">
          <DialogHeader><DialogTitle className="text-xl text-purple-800">{editingProduct ? "แก้ไขสินค้า" : "+ เพิ่มสินค้าใหม่"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-6">
            <ProductFormFields formData={formData} setFormData={setFormData} productTypes={productTypes} onShowProductTypeModal={() => setShowProductTypeModal(true)} />

            <Card>
              <CardHeader><CardTitle className="text-base">Tags</CardTitle><p className="text-sm text-gray-500">เพิ่ม Tag เพื่อช่วยในการค้นหา เช่น ชื่อตัวละคร, ชื่อซีรีส์ (กด Enter เพื่อเพิ่ม)</p></CardHeader>
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
                  <Input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newTagName = tagInput.trim();
                        if (newTagName && !selectedTags.some(t => t.value.toLowerCase() === newTagName.toLowerCase())) {
                          setSelectedTags([...selectedTags, { value: newTagName, label: newTagName }]);
                        }
                        setTagInput("");
                      }
                    }}
                    placeholder="พิมพ์ชื่อ Tag..." list="all-tags-list" />
                  <datalist id="all-tags-list">
                    {allTags.filter(tag => !selectedTags.some(s => s.value.toLowerCase() === tag.value.toLowerCase())).map(tag => <option key={tag.value} value={tag.value} />)}
                  </datalist>
                  <Button type="button" onClick={() => {
                      const newTagName = tagInput.trim();
                      if (newTagName && !selectedTags.some(t => t.value.toLowerCase() === newTagName.toLowerCase())) {
                        setSelectedTags([...selectedTags, { value: newTagName, label: newTagName }]);
                      }
                      setTagInput("");
                  }}>เพิ่ม Tag</Button>
                </div>
              </CardContent>
            </Card>

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
