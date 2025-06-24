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

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: any) => void;
  categories: string[];
  editingProduct?: Product | null;
}

const AddProductModal = ({ open, onOpenChange, onAddProduct, categories, editingProduct }: AddProductModalProps) => {
  const [formData, setFormData] = useState<Product>({
    sku: "",
    name: "",
    category: "",
    categories: [],
    productType: "",
    image: "",
    priceYuan: 0,
    exchangeRate: 1,
    priceThb: 0,
    importCost: 0,
    costThb: 0,
    sellingPrice: 0,
    status: "พรีออเดอร์",
    shipmentDate: "",
    link: "",
    description: ""
  });

  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  // Load product types when modal opens
  useEffect(() => {
    if (open) {
      fetchProductTypes().then(setProductTypes).catch(console.error);
    }
  }, [open]);

  // Auto-calculate ราคาบาท (THB)
  useEffect(() => {
    const y = parseFloat(formData.priceYuan as any) || 0;
    const r = parseFloat(formData.exchangeRate as any) || 0;
    if (y > 0 && r > 0) {
      setFormData(prev => ({
        ...prev,
        priceThb: parseFloat((y * r).toFixed(2))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        priceThb: 0
      }));
    }
  }, [formData.priceYuan, formData.exchangeRate]);

  // Auto-calculate ต้นทุนรวม (costThb)
  useEffect(() => {
    const totalCost = (parseFloat(formData.priceThb as any) || 0) + (parseFloat(formData.importCost as any) || 0);
    setFormData(prev => ({ ...prev, costThb: totalCost }));
  }, [formData.priceThb, formData.importCost]);

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
      setSelectedCategories(editingProduct.categories || [editingProduct.category].filter(Boolean));
      if (editingProduct.options) {
        const optionsWithIds = editingProduct.options.map(opt => ({
          ...opt,
          id: opt.id || nanoid()
        }));
        setOptions(optionsWithIds);
      } else {
        setOptions([]);
      }
      
      if (editingProduct.id) {
        fetchProductImages(editingProduct.id)
          .then(images => {
            setProductImages(images);
            if (images.length > 0) {
              setFormData(prev => ({ ...prev, image: images[0].image_url }));
            }
          })
          .catch(console.error);
      } else {
        setProductImages([]);
      }
    } else {
      setFormData({
        sku: "",
        name: "",
        category: "",
        categories: [],
        productType: "",
        image: "",
        priceYuan: 0,
        exchangeRate: 1,
        priceThb: 0,
        importCost: 0,
        costThb: 0,
        sellingPrice: 0,
        status: "พรีออเดอร์",
        shipmentDate: "",
        link: "",
        description: ""
      });
      setSelectedCategories([]);
      setOptions([]);
      setProductImages([]);
    }
  }, [editingProduct, open]);

  // Auto-generate SKU when categories change
  useEffect(() => {
    if (!editingProduct && (!formData.sku || formData.sku === "")) {
      if (selectedCategories.length > 0) {
        setFormData(prev => ({
          ...prev,
          sku: generateSKU(selectedCategories[0])
        }));
      }
    }
  }, [selectedCategories, open, editingProduct, formData.sku]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      if (newCategories.length > 0) {
        setFormData(prevForm => ({
          ...prevForm,
          category: newCategories[0],
          categories: newCategories
        }));
      } else {
        setFormData(prevForm => ({
          ...prevForm,
          category: "",
          categories: []
        }));
      }
      
      return newCategories;
    });
  };

  const handleImagesChange = (images: ProductImage[]) => {
    setProductImages(images);
    if (images.length > 0) {
      setFormData(prev => ({ ...prev, image: images[0].image_url }));
    } else {
      setFormData(prev => ({ ...prev, image: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || selectedCategories.length === 0) {
      alert("กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่");
      return;
    }

    let quantity = formData.quantity;
    if (options.length > 0) {
      quantity = options.reduce((sum, o) => sum + (o.quantity || 0), 0);
    }

    const productId = editingProduct?.id || Date.now();
    const uploadedImages: ProductImage[] = [];

    for (let i = 0; i < productImages.length; i++) {
      const img = productImages[i];
      if (img.file) {
        const folder = i === 0 ? "main" : "extra";
        const url = await uploadImageToStorage(img.file, productId, folder);
        if (url) {
          uploadedImages.push({
            image_url: url,
            id: img.id,
            product_id: img.product_id,
            order: img.order,
            created_at: img.created_at,
            variant_id: img.variant_id,
            variant_name: img.variant_name
          });
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
      options: options.length > 0 ? options : undefined,
      images: uploadedImages
    };

    try {
      await onAddProduct(dataToSave);
      onOpenChange(false);
      
      if (!editingProduct) {
        setFormData({
          sku: "",
          name: "",
          category: "",
          categories: [],
          productType: "",
          image: "",
          priceYuan: 0,
          exchangeRate: 1,
          priceThb: 0,
          importCost: 0,
          costThb: 0,
          sellingPrice: 0,
          status: "พรีออเดอร์",
          shipmentDate: "",
          link: "",
          description: ""
        });
        setSelectedCategories([]);
        setOptions([]);
        setProductImages([]);
      }
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
          <div className="space-y-4 mt-6">
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
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg"
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              disabled={!formData.name ||  selectedCategories.length === 0}
            >
              {editingProduct ? "บันทึกการแก้ไข" : "บันทึก"}
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
