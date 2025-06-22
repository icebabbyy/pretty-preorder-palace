
import { useEffect, useRef, useState } from "react";
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
  const [selectedImageType, setSelectedImageType] = useState<"main" | "extra" | "variant">("main");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

  // Categorize images by type
  const mainImages = images.filter(img => img.type === 'main');
  const extraImages = images.filter(img => img.type === 'extra');
  const variantImages = images.filter(img => img.type === 'variant');

  const uploadImageToStorage = async (file: File, type: string, index: number, variantId?: string): Promise<string | null> => {
    try {
      const fileExtension = file.name.split('.').pop();
      const variantPath = variantId ? `variant-${variantId}` : type;
      const filename = `${productId || 'temp'}/${variantPath}/${index}.${fileExtension}`;
      
      const { error } = await supabase.storage
        .from("product-images")
        .upload(filename, file, { upsert: true });
        
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filename);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "extra" | "variant") => {
    const file = e.target.files?.[0];
    if (!file || isUpdating) return;
    
    if (type === "variant" && !selectedVariant) {
      alert('กรุณาเลือกตัวเลือกสินค้าก่อนอัปโหลดรูป');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Calculate index for the new image
      let index = 0;
      if (type === 'main') {
        index = mainImages.length;
      } else if (type === 'extra') {
        index = extraImages.length;
      } else if (type === 'variant') {
        const existingVariantImages = variantImages.filter(img => img.variant_id === selectedVariant);
        index = existingVariantImages.length;
      }
      
      const url = await uploadImageToStorage(file, type, index, type === 'variant' ? selectedVariant : undefined);
      
      if (url) {
        let variantName: string | undefined;
        if (type === 'variant' && selectedVariant) {
          const selectedVariantOption = productOptions.find(opt => opt.id === selectedVariant);
          variantName = selectedVariantOption?.name;
        }

        if (productId) {
          const newImage = await addProductImage(
            productId, 
            url, 
            index,
            type === 'variant' ? selectedVariant : undefined, 
            variantName,
            type
          );
          const updated = [...images, newImage];
          setImages(updated);
          onImagesChange(updated);
        } else {
          // For new products, add to local state
          const tempImage: ProductImage = {
            id: Date.now(),
            product_id: 0,
            image_url: url,
            order: index,
            created_at: new Date().toISOString(),
            variant_id: type === 'variant' ? selectedVariant : null,
            variant_name: variantName || null,
            type: type,
            index: index
          };
          const updated = [...images, tempImage];
          setImages(updated);
          onImagesChange(updated);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + error.message);
    } finally {
      setIsUpdating(false);
      setSelectedVariant("");
      
      // Clear file inputs
      if (mainFileInputRef.current) mainFileInputRef.current.value = '';
      if (extraFileInputRef.current) extraFileInputRef.current.value = '';
      if (variantFileInputRef.current) variantFileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      if (productId && imageId > 0) {
        await deleteProductImage(imageId);
      }
      
      const updated = images.filter(img => img.id !== imageId);
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
      reordered.forEach((img, i) => (img.index = i));
      
      const updatedAllImages = images.map(img => {
        const reorderedImg = reordered.find(r => r.id === img.id);
        return reorderedImg || img;
      });
      
      setImages(updatedAllImages);
      onImagesChange(updatedAllImages);
      
      if (productId) {
        await reorderProductImages(
          reordered.map((img) => ({ id: img.id, order: img.index || 0 }))
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
                <div className="text-sm font-medium">รูปภาพที่ {index + 1}</div>
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
                  onClick={() => handleDeleteImage(img.id)}
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

  const renderUploadSection = (type: "main" | "extra" | "variant", title: string, description: string, fileInputRef: React.RefObject<HTMLInputElement>) => (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === "variant" && productOptions.length > 0 && (
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

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFileUpload(e, type)}
          disabled={disabled || isUpdating || (type === "variant" && !selectedVariant)}
        />
        
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={disabled || isUpdating || (type === "variant" && !selectedVariant)}
          variant="outline"
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUpdating ? 'กำลังอัปโหลด...' : `อัปโหลด${title}`}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">จัดการรูปภาพสินค้า</Label>
      </div>
      
      {/* Upload Sections */}
      <div className="grid gap-4 md:grid-cols-3">
        {renderUploadSection("main", "🖼️ รูปภาพหลัก", "รูปภาพหลักของสินค้า", mainFileInputRef)}
        {renderUploadSection("extra", "📸 รูปภาพเพิ่มเติม", "รูปภาพประกอบเพิ่มเติม", extraFileInputRef)}
        {productOptions.length > 0 && renderUploadSection("variant", "🧩 รูปภาพตัวเลือกสินค้า", "รูปภาพเฉพาะของแต่ละตัวเลือก", variantFileInputRef)}
      </div>

      <Separator />

      {/* Image Lists */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">รูปภาพที่มีอยู่</h3>
        
        {/* Main Images */}
        {renderImageList(mainImages, "🖼️ รูปภาพหลักของสินค้า", "ยังไม่มีรูปภาพหลัก")}
        
        {/* Extra Images */}
        {renderImageList(extraImages, "📸 รูปภาพเพิ่มเติม", "ยังไม่มีรูปภาพเพิ่มเติม")}
        
        {/* Variant Images */}
        {productOptions.length > 0 && renderImageList(variantImages, "🧩 รูปภาพตัวเลือกสินค้า", "ยังไม่มีรูปภาพตัวเลือกสินค้า")}
      </div>
    </div>
  );
};

export default ProductImageManager;
