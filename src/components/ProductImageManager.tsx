
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, ArrowUp, ArrowDown } from "lucide-react";
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
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

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
            await addImage(url);
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
  }, [isUpdating]);

  const addImage = async (url: string, variantId?: string) => {
    if (!url.trim() || isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log('Adding image:', url, 'Product ID:', productId, 'Variant ID:', variantId);
      
      const selectedVariantOption = variantId ? productOptions.find(opt => opt.id === variantId) : null;
      
      if (productId) {
        // For existing products, add to database
        const newImage = await addProductImage(
          productId, 
          url.trim(), 
          undefined, 
          variantId || undefined, 
          selectedVariantOption?.name || undefined
        );
        const updated = [...images, newImage];
        setImages(updated);
        onImagesChange(updated);
        console.log('Image added to database:', newImage);
      } else {
        // For new products, add to local state
        const tempImage: ProductImage = {
          id: Date.now(), // Temporary ID
          product_id: 0,
          image_url: url.trim(),
          order: images.length + 1,
          created_at: new Date().toISOString(),
          variant_id: variantId || null,
          variant_name: selectedVariantOption?.name || null
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

  const handleAddImageUrl = async () => {
    if (!newImageUrl.trim()) return;
    await addImage(newImageUrl, selectedVariant || undefined);
    setNewImageUrl("");
    setSelectedVariant("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isUpdating) return;
    
    setIsUpdating(true);
    const url = await uploadImageToStorage(file);
    if (url) {
      await addImage(url, selectedVariant || undefined);
    }
    setIsUpdating(false);
    setSelectedVariant("");
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: number, index: number) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log('Deleting image:', imageId, 'at index:', index);
      
      // Delete from database if it's a real image (not temporary)
      if (productId && imageId > 0) {
        await deleteProductImage(imageId);
        console.log('Image deleted from database');
      }
      
      // Update local state
      const updated = images.filter((_, i) => i !== index);
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

  const handleMoveImage = async (index: number, direction: "up" | "down") => {
    if (isUpdating) return;
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    
    try {
      setIsUpdating(true);
      const reordered = [...images];
      [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
      reordered.forEach((img, i) => (img.order = i + 1));
      
      setImages(reordered);
      onImagesChange(reordered);
      
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

  const handleImageUrlChange = async (index: number, newUrl: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const updated = [...images];
      updated[index].image_url = newUrl;
      setImages(updated);
      onImagesChange(updated);
      
      if (productId && updated[index].id > 0) {
        await updateProductImage(updated[index].id, { image_url: newUrl });
      }
    } catch (error) {
      console.error('Error updating image URL:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดต URL รูปภาพ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVariantChange = async (imageIndex: number, variantId: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const updated = [...images];
      const selectedVariantOption = variantId ? productOptions.find(opt => opt.id === variantId) : null;
      
      updated[imageIndex].variant_id = variantId || null;
      updated[imageIndex].variant_name = selectedVariantOption?.name || null;
      
      setImages(updated);
      onImagesChange(updated);
      
      if (productId && updated[imageIndex].id > 0) {
        await updateProductImage(updated[imageIndex].id, { 
          variant_id: variantId || null,
          variant_name: selectedVariantOption?.name || null
        });
      }
    } catch (error) {
      console.error('Error updating image variant:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตตัวเลือกสินค้า');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>จัดการรูปภาพสินค้า</Label>
      
      {/* File Upload */}
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        disabled={disabled || isUpdating}
      />
      
      {/* Variant Selection for New Images */}
      {productOptions.length > 0 && (
        <div className="space-y-2">
          <Label>เลือกตัวเลือกสินค้า (ไม่บังคับ)</Label>
          <Select value={selectedVariant} onValueChange={setSelectedVariant}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกตัวเลือกสินค้า หรือปล่อยว่างสำหรับรูปหลัก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">รูปหลักของสินค้า</SelectItem>
              {productOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Add Image Controls */}
      <div className="flex gap-2">
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={disabled || isUpdating}
          variant="outline"
        >
          {isUpdating ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
        </Button>
        <div className="flex-1 flex gap-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="หรือใส่ URL รูปภาพ"
            disabled={disabled || isUpdating}
          />
          <Button 
            onClick={handleAddImageUrl}
            disabled={disabled || isUpdating || !newImageUrl.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Images List */}
      <div className="grid gap-3">
        {images.map((img, index) => (
          <Card key={`${img.id}-${index}`} className="border">
            <CardContent className="flex gap-3 p-3 items-center">
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
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  disabled={isUpdating}
                />
                {productOptions.length > 0 && (
                  <Select 
                    value={img.variant_id || ""} 
                    onValueChange={(value) => handleVariantChange(index, value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="เลือกตัวเลือกสินค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">รูปหลักของสินค้า</SelectItem>
                      {productOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMoveImage(index, "up")}
                  disabled={index === 0 || isUpdating}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMoveImage(index, "down")}
                  disabled={index === images.length - 1 || isUpdating}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteImage(img.id, index)}
                  className="text-red-500"
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                {index === 0 && !img.variant_id && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                    รูปหลัก
                  </span>
                )}
                {img.variant_id && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {img.variant_name}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {images.length === 0 && <p className="text-center text-gray-500">ยังไม่มีรูปภาพสินค้า</p>}
      </div>
      
      <p className="text-sm text-gray-500">
        💡 เคล็ดลับ: คุณสามารถ Paste รูปภาพจาก clipboard ได้โดยตรง (Ctrl+V) และเลือกตัวเลือกสินค้าเพื่อจัดหมวดหมู่รูปภาพ
      </p>
    </div>
  );
};

export default ProductImageManager;
