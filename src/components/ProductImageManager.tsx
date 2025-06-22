
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, ArrowUp, ArrowDown, Upload, ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  addProductImage,
  deleteProductImage,
  reorderProductImages,
  updateProductImage,
  type ProductImage,
} from "@/utils/productImages";
import { supabase } from "@/integrations/supabase/client";
import { ProductOption } from "@/types";

interface ProductImageManagerProps {
  productId?: number;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  disabled?: boolean;
  productOptions?: ProductOption[];
}

const ProductImageManager = ({
  productId,
  images: initialImages,
  onImagesChange,
  disabled = false,
  productOptions = [],
}: ProductImageManagerProps) => {
  const [images, setImages] = useState<ProductImage[]>(initialImages || []);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedImageType, setSelectedImageType] = useState<"main" | "additional" | "variant">("main");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

  // Categorize images
  const mainImages = images.filter(img => !img.variant_id && img.order === 1);
  const additionalImages = images.filter(img => !img.variant_id && img.order > 1);
  const variantImages = images.filter(img => img.variant_id);

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const filename = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("product-images").upload(filename, file);
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || isUpdating) return;
    
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          setIsUpdating(true);
          const url = await uploadImageToStorage(file);
          if (url) {
            await addImageByType(url);
          }
          setIsUpdating(false);
        }
      }
    }
  };

  useEffect(() => {
    const handlePasteEvent = (e: Event) => handlePaste(e as ClipboardEvent);
    window.addEventListener("paste", handlePasteEvent);
    return () => window.removeEventListener("paste", handlePasteEvent);
  }, [isUpdating, selectedImageType, selectedVariant]);

  const addImageByType = async (url: string) => {
    if (!url.trim() || isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log('Adding image:', url, 'Type:', selectedImageType, 'Variant:', selectedVariant);
      
      let variantId: string | undefined;
      let variantName: string | undefined;
      let order: number | undefined;

      if (selectedImageType === "variant" && selectedVariant) {
        const selectedVariantOption = productOptions.find(opt => opt.id === selectedVariant);
        variantId = selectedVariant;
        variantName = selectedVariantOption?.name;
      } else if (selectedImageType === "main") {
        order = 1; // Main image always has order 1
      } else if (selectedImageType === "additional") {
        // Find the next order number for additional images
        const maxOrder = Math.max(...additionalImages.map(img => img.order), 1);
        order = maxOrder + 1;
      }

      if (productId) {
        const newImage = await addProductImage(
          productId, 
          url.trim(), 
          order, 
          variantId, 
          variantName
        );
        const updated = [...images, newImage];
        setImages(updated);
        onImagesChange(updated);
        console.log('Image added to database:', newImage);

        // If this is for a variant, also update the variant's image in the product options
        if (variantId && variantName) {
          await updateVariantImageInProduct(variantId, url.trim());
        }
      } else {
        // For new products, add to local state
        const tempImage: ProductImage = {
          id: Date.now(),
          product_id: 0,
          image_url: url.trim(),
          order: order || images.length + 1,
          created_at: new Date().toISOString(),
          variant_id: variantId || null,
          variant_name: variantName || null
        };
        const updated = [...images, tempImage];
        setImages(updated);
        onImagesChange(updated);
        console.log('Image added to local state:', tempImage);
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มรูปภาพ: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function to update variant image in the product's options
  const updateVariantImageInProduct = async (variantId: string, imageUrl: string) => {
    if (!productId) return;
    
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('options')
        .eq('id', productId)
        .single();

      if (error || !product?.options) {
        console.error('Error fetching product options:', error);
        return;
      }

      const optionsArray = Array.isArray(product.options) ? product.options : [];
      const updatedOptions = optionsArray.map((option: any) => {
        if (option.id === variantId) {
          return { ...option, image: imageUrl };
        }
        return option;
      });

      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          options: updatedOptions,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) {
        console.error('Error updating product options:', updateError);
      } else {
        console.log('Updated variant image in product options');
      }
    } catch (error) {
      console.error('Error updating variant image in product:', error);
    }
  };

  const handleAddImageUrl = async () => {
    if (!newImageUrl.trim()) return;
    await addImageByType(newImageUrl);
    setNewImageUrl("");
    setSelectedVariant("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isUpdating) return;
    
    setIsUpdating(true);
    const url = await uploadImageToStorage(file);
    if (url) {
      await addImageByType(url);
    }
    setIsUpdating(false);
    setSelectedVariant("");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: number, index: number, imageList: ProductImage[]) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log('Deleting image:', imageId, 'at index:', index);
      
      if (productId && imageId > 0) {
        await deleteProductImage(imageId);
        console.log('Image deleted from database');
      }
      
      const updated = images.filter(img => img.id !== imageId);
      console.log('Updated images after delete:', updated);
      
      setImages(updated);
      onImagesChange(updated);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('เกิดข้อผิดพลาดในการลบรูปภาพ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveImage = async (imageId: number, direction: "up" | "down", imageList: ProductImage[]) => {
    if (isUpdating) return;
    
    const currentIndex = imageList.findIndex(img => img.id === imageId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= imageList.length) return;
    
    try {
      setIsUpdating(true);
      const reordered = [...imageList];
      [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
      reordered.forEach((img, i) => (img.order = i + 1));
      
      const updatedAllImages = images.map(img => {
        const reorderedImg = reordered.find(r => r.id === img.id);
        return reorderedImg || img;
      });
      
      setImages(updatedAllImages);
      onImagesChange(updatedAllImages);
      
      if (productId) {
        await reorderProductImages(
          reordered.map((img) => ({ id: img.id, order: img.order }))
        );
      }
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('เกิดข้อผิดพลาดในการเรียงลำดับรูปภาพ');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderImageList = (imageList: ProductImage[], title: string, emptyMessage: string) => (
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          {title}
          <span className="text-xs text-gray-500">({imageList.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {imageList.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">{emptyMessage}</p>
        ) : (
          imageList.map((img, index) => (
            <div key={`${img.id}-${index}`} className="flex gap-3 p-3 items-center border rounded">
              <img
                src={img.image_url}
                alt=""
                className="w-16 h-16 object-cover rounded border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div className="flex-1 space-y-2">
                <Input
                  value={img.image_url}
                  onChange={(e) => handleImageUrlChange(img.id, e.target.value)}
                  disabled={isUpdating}
                  className="text-xs"
                />
                {img.variant_id && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {img.variant_name}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMoveImage(img.id, "up", imageList)}
                  disabled={index === 0 || isUpdating}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMoveImage(img.id, "down", imageList)}
                  disabled={index === imageList.length - 1 || isUpdating}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteImage(img.id, index, imageList)}
                  className="text-red-500"
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  const handleImageUrlChange = async (imageId: number, newUrl: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const updated = images.map(img => 
        img.id === imageId ? { ...img, image_url: newUrl } : img
      );
      setImages(updated);
      onImagesChange(updated);
      
      if (productId && imageId > 0) {
        await updateProductImage(imageId, { image_url: newUrl });
        
        const image = images.find(img => img.id === imageId);
        if (image?.variant_id) {
          await updateVariantImageInProduct(image.variant_id, newUrl);
        }
      }
    } catch (error) {
      console.error('Error updating image URL:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดต URL รูปภาพ');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">จัดการรูปภาพสินค้า</Label>
      </div>
      
      {/* Add Image Controls */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-base">เพิ่มรูปภาพใหม่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Type Selection */}
          <div className="space-y-2">
            <Label>ประเภทรูปภาพ *</Label>
            <Select value={selectedImageType} onValueChange={(value: "main" | "additional" | "variant") => setSelectedImageType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทรูปภาพ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">🖼️ รูปภาพหลักของสินค้า</SelectItem>
                <SelectItem value="additional">📸 รูปภาพเพิ่มเติม</SelectItem>
                <SelectItem value="variant">🧩 รูปภาพของตัวเลือกสินค้า</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Variant Selection - only show when variant is selected */}
          {selectedImageType === "variant" && productOptions.length > 0 && (
            <div className="space-y-2">
              <Label>เลือกตัวเลือกสินค้า *</Label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตัวเลือกสินค้าที่ต้องการเพิ่มรูป" />
                </SelectTrigger>
                <SelectContent>
                  {productOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Upload Controls */}
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
            disabled={disabled || isUpdating || (selectedImageType === "variant" && !selectedVariant)}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={disabled || isUpdating || (selectedImageType === "variant" && !selectedVariant)}
              variant="outline"
            >
              {isUpdating ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
            </Button>
            <div className="flex-1 flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="หรือใส่ URL รูปภาพ"
                disabled={disabled || isUpdating || (selectedImageType === "variant" && !selectedVariant)}
              />
              <Button 
                onClick={handleAddImageUrl}
                disabled={disabled || isUpdating || !newImageUrl.trim() || (selectedImageType === "variant" && !selectedVariant)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            💡 เคล็ดลับ: คุณสามารถ Paste รูปภาพจาก clipboard ได้โดยตรง (Ctrl+V)
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Image Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">รูปภาพที่มีอยู่</h3>
        
        {/* Main Images */}
        {renderImageList(mainImages, "🖼️ รูปภาพหลักของสินค้า", "ยังไม่มีรูปภาพหลัก")}
        
        {/* Additional Images */}
        {renderImageList(additionalImages, "📸 รูปภาพเพิ่มเติม", "ยังไม่มีรูปภาพเพิ่มเติม")}
        
        {/* Variant Images */}
        {productOptions.length > 0 && renderImageList(variantImages, "🧩 รูปภาพตัวเลือกสินค้า", "ยังไม่มีรูปภาพตัวเลือกสินค้า")}
      </div>
    </div>
  );
};

export default ProductImageManager;
