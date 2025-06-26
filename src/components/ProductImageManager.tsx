
// src/components/ProductImageManager.tsx

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, ArrowUp, ArrowDown, Upload, ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { addProductImage, deleteProductImage, reorderProductImages, updateProductImage } from "@/utils/productImages";
import { supabase } from "@/integrations/supabase/client";
import { ProductOption, ProductImage } from "@/types";

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedImageType, setSelectedImageType] = useState<"main" | "additional" | "variant">("main");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Categorize images from props directly
  const mainImages = initialImages.filter(img => !img.variant_id && img.order === 1);
  const additionalImages = initialImages.filter(img => !img.variant_id && (img.order || 0) > 1).sort((a, b) => (a.order || 0) - (b.order || 0));
  const variantImages = initialImages.filter(img => img.variant_id);

  // Upload image to Supabase storage
  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const filename = `${Date.now()}_${file.name}`;
      const filePath = `${productId || 'temp'}/${filename}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Upload Image Error:", error);
      return null;
    }
  };

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await handleFileUpload(file);
          }
        }
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (!files) return;

      for (const file of files) {
        if (file.type.indexOf("image") !== -1) {
          await handleFileUpload(file);
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('paste', handlePaste);
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener('drop', handleDrop);
      dropZone.addEventListener('dragover', handleDragOver);
    }

    return () => {
      document.removeEventListener('paste', handlePaste);
      if (dropZone) {
        dropZone.removeEventListener('drop', handleDrop);
        dropZone.removeEventListener('dragover', handleDragOver);
      }
    };
  }, [selectedImageType, selectedVariant]);

  const handleFileUpload = async (file: File) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const uploadedUrl = await uploadImageToStorage(file);
      if (uploadedUrl) {
        await addImageByType(uploadedUrl);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setIsUpdating(false);
    }
  };

  const addImageByType = async (url: string) => {
    if (!url.trim() || isUpdating) return;
    
    try {
      setIsUpdating(true);
      let newImagePayload: Partial<ProductImage> = { image_url: url.trim() };

      if (selectedImageType === "variant" && selectedVariant) {
        const variant = productOptions.find(opt => opt.id === selectedVariant);
        newImagePayload.variant_id = variant?.id;
        newImagePayload.variant_name = variant?.name;
      } else if (selectedImageType === "main") {
        newImagePayload.order = 1;
      } else {
        const maxOrder = Math.max(0, ...initialImages.filter(img => !img.variant_id).map(img => img.order || 0));
        newImagePayload.order = maxOrder + 1;
      }

      if (productId) {
        const newImage = await addProductImage(productId, newImagePayload.image_url!, newImagePayload.order, newImagePayload.variant_id, newImagePayload.variant_name);
        onImagesChange([...initialImages, newImage]);
        if (newImage.variant_id) await updateVariantImageInProduct(newImage.variant_id, newImage.image_url);
      } else {
        const tempImage: ProductImage = {
          id: Date.now(), // Fix: Use number instead of string for temp ID
          image_url: newImagePayload.image_url!,
          order: newImagePayload.order || initialImages.length + 2,
          variant_id: newImagePayload.variant_id,
          variant_name: newImagePayload.variant_name,
        };
        onImagesChange([...initialImages, tempImage]);
      }
    } catch (error: any) {
      console.error('Error adding image:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มรูปภาพ: ' + error.message);
    } finally {
      setIsUpdating(false);
      setNewImageUrl("");
      setSelectedVariant("");
    }
  };
  
  const updateVariantImageInProduct = async (variantId: string, imageUrl: string) => {
    // Update variant image in product options if needed
    console.log('Updating variant image:', variantId, imageUrl);
  };

  const handleAddImageUrl = async () => {
    await addImageByType(newImageUrl);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleImageUrlChange = async (imageId: number | string | undefined, newUrl: string) => {
    if (!imageId) return;
    
    const updatedImages = initialImages.map(img => 
      img.id === imageId ? { ...img, image_url: newUrl } : img
    );
    onImagesChange(updatedImages);

    if (productId && typeof imageId === 'number' && imageId > 0) {
      try {
        await updateProductImage(imageId, { image_url: newUrl });
        const image = initialImages.find(img => img.id === imageId);
        if (image?.variant_id) {
          await updateVariantImageInProduct(image.variant_id, newUrl);
        }
      } catch (error) {
        console.error("Error updating image URL in DB:", error);
        onImagesChange(initialImages);
      }
    }
  };

  const handleDeleteImage = async (imageId: number | string | undefined) => {
    if (isUpdating || !imageId) return;
    
    try {
      setIsUpdating(true);
      if (productId && typeof imageId === 'number' && imageId > 0) {
        await deleteProductImage(imageId);
      }
      const updated = initialImages.filter(img => img.id !== imageId);
      onImagesChange(updated);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert('เกิดข้อผิดพลาดในการลบรูปภาพ: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleMoveImage = async (imageId: number | string | undefined, direction: "up" | "down") => {
    if (isUpdating || !imageId) return;

    const listToReorder = initialImages.filter(img => !img.variant_id).sort((a,b) => (a.order || 0) - (b.order || 0));
    const currentIndex = listToReorder.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= listToReorder.length) return;

    [listToReorder[currentIndex], listToReorder[newIndex]] = [listToReorder[newIndex], listToReorder[currentIndex]];

    const reorderedWithNumbers = listToReorder.map((img, index) => ({ ...img, order: index + 1 }));

    const updatedAllImages = [
      ...reorderedWithNumbers,
      ...variantImages
    ];
    onImagesChange(updatedAllImages);

    if (productId) {
      setIsUpdating(true);
      await reorderProductImages(
        reorderedWithNumbers.map(img => ({ id: img.id as number, order: img.order as number }))
      );
      setIsUpdating(false);
    }
  };

  const renderImageList = (imageList: ProductImage[], title: string, canMove: boolean = false) => (
    <div>
      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-gray-600" /> {title} <span className="text-xs text-gray-500">({imageList.length})</span>
      </h4>
      <div className="space-y-2 p-2 border rounded-md bg-gray-50/50">
        {imageList.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">ยังไม่มีรูปภาพ</p>
        ) : (
          imageList.map((img, index) => (
            <div key={img.id || `temp-${index}`} className="flex gap-3 p-2 items-center bg-white border rounded-md shadow-sm">
              <img src={img.image_url} alt="" className="w-16 h-16 object-cover rounded border" />
              <div className="flex-1 space-y-2">
                <Input value={img.image_url} onChange={(e) => handleImageUrlChange(img.id, e.target.value)} disabled={isUpdating} className="text-xs" />
                {img.variant_id && (<span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">{img.variant_name}</span>)}
              </div>
              <div className="flex flex-col gap-1">
                {canMove && (
                  <>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleMoveImage(img.id, "up")} disabled={index === 0 || isUpdating}><ArrowUp className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleMoveImage(img.id, "down")} disabled={index === imageList.length - 1 || isUpdating}><ArrowDown className="w-4 h-4" /></Button>
                  </>
                )}
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 self-start text-red-500 hover:text-red-600" onClick={() => handleDeleteImage(img.id)} disabled={isUpdating}><X className="w-4 h-4" /></Button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6" ref={dropZoneRef}>
      <Card className="border-purple-200">
        <CardHeader><CardTitle className="text-base">เพิ่มรูปภาพใหม่</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>1. เลือกประเภทรูปภาพ *</Label>
              <Select value={selectedImageType} onValueChange={(value: any) => setSelectedImageType(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">🖼️ รูปภาพหลักของสินค้า</SelectItem>
                  <SelectItem value="additional">📸 รูปภาพเพิ่มเติม</SelectItem>
                  <SelectItem value="variant">🧩 รูปภาพของตัวเลือกสินค้า</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedImageType === "variant" && (
              <div>
                <Label>2. เลือกตัวเลือกสินค้า *</Label>
                <Select value={selectedVariant} onValueChange={setSelectedVariant} disabled={productOptions.length === 0}>
                  <SelectTrigger><SelectValue placeholder="เลือกตัวเลือกสินค้า..." /></SelectTrigger>
                  <SelectContent>
                    {productOptions.map((option) => (<SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div>
            <Label>3. อัปโหลดหรือใส่ URL</Label>
            <Input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <div className="flex gap-2 mt-1">
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUpdating} variant="outline"><Upload className="w-4 h-4 mr-2"/> เลือกไฟล์</Button>
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="หรือใส่ URL รูปภาพ แล้วกดบวก" disabled={isUpdating} />
              <Button onClick={handleAddImageUrl} disabled={isUpdating || !newImageUrl.trim()}><Plus className="w-4 h-4" /></Button>
            </div>
             <p className="text-sm text-gray-500 mt-2">💡 เคล็ดลับ: คุณสามารถ Paste รูปภาพจาก clipboard ได้โดยตรง (Ctrl+V) หรือ Drag & Drop ไฟล์รูปภาพลงในพื้นที่นี้</p>
          </div>
        </CardContent>
      </Card>
      <Separator />
      <div className="space-y-4">
        {renderImageList(mainImages, "รูปภาพหลัก", true)}
        {renderImageList(additionalImages, "รูปภาพเพิ่มเติม", true)}
        {productOptions.length > 0 && renderImageList(variantImages, "รูปภาพตัวเลือกสินค้า", false)}
      </div>
    </div>
  );
};

export default ProductImageManager;
