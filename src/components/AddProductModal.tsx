
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import { Product, ProductOption, ProductImage } from "@/types";
import { generateSKU } from "@/utils/sku";
import { fetchProductTypes } from "@/utils/productTypes";
import { fetchProductImages } from "@/utils/productImages";
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
  const [formData, setFormData] = useState<Product>({
    sku: "", name: "", category: "", categories: [], productType: "", image: "",
    priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0,
    sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "", quantity: 0
  });
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data on open/edit
  useEffect(() => {
    if (open) { 
      fetchProductTypes().then(setProductTypes).catch(console.error); 
    }
  }, [open]);

  // Calculate price THB when yuan price or exchange rate changes
  useEffect(() => {
    const y = parseFloat(formData.priceYuan as any) || 0;
    const r = parseFloat(formData.exchangeRate as any) || 0;
    if (y > 0 && r > 0) {
      setFormData(prev => ({ ...prev, priceThb: parseFloat((y * r).toFixed(2)) }));
    } else {
      setFormData(prev => ({ ...prev, priceThb: 0 }));
    }
  }, [formData.priceYuan, formData.exchangeRate]);

  // Calculate total cost
  useEffect(() => {
    const totalCost = (parseFloat(formData.priceThb as any) || 0) + (parseFloat(formData.importCost as any) || 0);
    setFormData(prev => ({ ...prev, costThb: totalCost }));
  }, [formData.priceThb, formData.importCost]);

  // Load editing product data
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...editingProduct,
        quantity: editingProduct.quantity || 0
      });
      setSelectedCategories(editingProduct.categories || [editingProduct.category].filter(Boolean));
      setOptions(editingProduct.options?.map(opt => ({ ...opt, id: opt.id || nanoid() })) || []);
      
      if (editingProduct.id) {
        fetchProductImages(editingProduct.id).then(images => {
          setProductImages(images);
          if (images.length > 0) {
            setFormData(prev => ({ ...prev, image: images[0].image_url }));
          }
        }).catch(console.error);

        const fetchProductTags = async () => {
          try {
            const { data } = await supabase
              .from('product_tags')
              .select('tags(name)')
              .eq('product_id', editingProduct.id);
            const currentTags = (data || []).map((pt: any) => pt.tags?.name).filter(Boolean);
            setSelectedTags(currentTags);
          } catch (error) {
            console.error("Error fetching tags:", error);
          }
        };
        fetchProductTags();
      } else {
        setProductImages([]);
        setSelectedTags([]);
      }
    } else {
      // Reset form for new product
      setFormData({
        sku: "", name: "", category: "", categories: [], productType: "", image: "",
        priceYuan: 0, exchangeRate: 1, priceThb: 0, importCost: 0, costThb: 0,
        sellingPrice: 0, status: "พรีออเดอร์", shipmentDate: "", link: "", description: "", quantity: 0
      });
      setSelectedCategories([]);
      setOptions([]);
      setProductImages([]);
      setSelectedTags([]);
      setTagInput("");
    }
  }, [editingProduct, open]);

  // Generate SKU when categories change (for new products only)
  useEffect(() => {
    if (!editingProduct && (!formData.sku || formData.sku === "")) {
      if (selectedCategories.length > 0) {
        setFormData(prev => ({ ...prev, sku: generateSKU(selectedCategories[0]) }));
      }
    }
  }, [selectedCategories, open, editingProduct, formData.sku]);
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  // Update form data when categories change
  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      categories: selectedCategories, 
      category: selectedCategories[0] || "" 
    }));
  }, [selectedCategories]);

  const handleImagesChange = (images: ProductImage[]) => {
    setProductImages(images);
    setFormData(prev => ({ 
      ...prev, 
      image: images.length > 0 ? images[0].image_url : "" 
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || selectedCategories.length === 0) { 
      alert("กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่"); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      let quantity = formData.quantity || 0;
      if (options.length > 0) { 
        quantity = options.reduce((sum, o) => sum + (o.quantity || 0), 0); 
      }

      const dataToSave = {
        ...formData,
        categories: selectedCategories,
        category: selectedCategories[0],
        quantity,
        options: options.length > 0 ? options : undefined,
        images: productImages,
        tags: selectedTags,
      };
      
      console.log("Submitting product data:", dataToSave);
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <ProductFormFields 
              formData={formData} 
              setFormData={setFormData} 
              productTypes={productTypes} 
              onShowProductTypeModal={() => setShowProductTypeModal(true)} 
            />
            <ProductCategorySelector 
              categories={categories} 
              selectedCategories={selectedCategories} 
              toggleCategory={toggleCategory} 
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
                <p className="text-sm text-gray-500">เพิ่ม Tag (พิมพ์แล้วกด Enter)</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[2.5rem]">
                  {selectedTags.map(tag => (
                    <div key={tag} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium">
                      <span>{tag}</span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedTags(current => current.filter(t => t !== tag))} 
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    value={tagInput} 
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newTag = tagInput.trim();
                        if (newTag && !selectedTags.find(t => t.toLowerCase() === newTag.toLowerCase())) {
                          setSelectedTags(curr => [...curr, newTag]);
                        }
                        setTagInput("");
                      }
                    }} 
                    placeholder="พิมพ์ Tag แล้วกด Enter..."
                  />
                  <Button 
                    type="button" 
                    onClick={() => {
                      const newTag = tagInput.trim();
                      if (newTag && !selectedTags.find(t => t.toLowerCase() === newTag.toLowerCase())) {
                        setSelectedTags(curr => [...curr, newTag]);
                      }
                      setTagInput("");
                    }}
                  >
                    เพิ่ม
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ProductImageManager 
              productId={editingProduct?.id?.toString()} 
              images={productImages} 
              onImagesChange={handleImagesChange} 
              disabled={isSubmitting} 
              productOptions={options} 
            />
            <ProductPricingFields 
              formData={formData} 
              setFormData={setFormData} 
            />
            <ProductOptionsManager 
              options={options} 
              setOptions={setOptions} 
              category={selectedCategories[0] || ""}
              editingProductId={editingProduct?.id}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.name || selectedCategories.length === 0 || isSubmitting}
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
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
