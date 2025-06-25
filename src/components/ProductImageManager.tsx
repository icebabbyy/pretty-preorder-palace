// src/components/ProductImageManager.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Upload, ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { nanoid } from "nanoid";
import { uploadImageToStorage, deleteProductImage as dbDeleteProductImage } from "@/utils/productImages";
import type { ProductImage, ProductOption } from "@/types";

interface ProductImageManagerProps {
  productId?: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  disabled?: boolean;
  productOptions: ProductOption[];
}

const ProductImageManager = ({
  productId,
  images,
  onImagesChange,
  disabled = false,
  productOptions = [],
}: ProductImageManagerProps) => {

  const [isUpdating, setIsUpdating] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedImageType, setSelectedImageType] = useState<"main" | "additional" | "variant">("main");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Categorize images for display ---
  const mainImage = images.find(img => img.order === 1 && !img.variant_id);
  const additionalImages = images.filter(img => img.order !== 1 && !img.variant_id).sort((a, b) => (a.order || 99) - (b.order || 99));
  const variantImages = images.filter(img => !!img.variant_id);

  // --- Image Handling Functions ---
  const addImage = async (url: string, file?: File) => {
    if ((!url && !file) || isUpdating) return;

    // Validate variant selection
    if (selectedImageType === "variant" && !selectedVariant) {
      alert("กรุณาเลือกตัวเลือกสินค้าสำหรับรูปภาพนี้");
      return;
    }

    setIsUpdating(true);
    try {
      const imageUrl = file ? await uploadImageToStorage(file, productId || nanoid(), "images") : url;
      if (!imageUrl) throw new Error("ไม่สามารถอัปโหลดหรือใช้ URL นี้ได้");

      let newImageList = [...images];
      const newImage: ProductImage = { id: nanoid(), image_url: imageUrl, order: 0, file };

      if (selectedImageType === "variant") {
        const variant = productOptions.find(opt => opt.id === selectedVariant);
        newImage.variant_id = variant?.id;
        newImage.variant_name = variant?.name;
        delete newImage.order; // Variant images don't use 'order'
      } else if (selectedImageType === "main") {
        newImage.order = 1;
        // Demote existing main image to an additional image
        newImageList = newImageList.map(img => img.order === 1 ? { ...img, order: 99 } : img);
      } else { // Additional
        const maxOrder = Math.max(1, ...newImageList.filter(img => !img.variant_id).map(img => img.order || 1));
        newImage.order = maxOrder + 1;
      }
      
      onImagesChange([...newImageList, newImage]);
      setNewImageUrl("");

    } catch (error: any) {
      alert("เกิดข้อผิดพลาดในการเพิ่มรูปภาพ: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteImage = async (imageId: string | number) => {
    // Optimistic UI update
    const newImages = images.filter(img => img.id !== imageId);
    onImagesChange(newImages);

    // If it's a saved image (numeric ID), delete from DB
    if (typeof imageId === 'number') {
      try {
        await dbDeleteProductImage(imageId);
      } catch (error) {
        console.error("Failed to delete image from DB, reverting UI.", error);
        onImagesChange(images); // Revert on failure
        alert("ลบรูปภาพออกจากฐานข้อมูลไม่สำเร็จ");
      }
    }
  };

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (isUpdating || disabled) return;
    const file = e.clipboardData?.items[0]?.getAsFile();
    if (file && file.type.startsWith("image/")) {
      e.preventDefault();
      await addImage("", file);
    }
  }, [isUpdating, disabled, images, selectedImageType, selectedVariant]); // Add all dependencies

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => { window.removeEventListener("paste", handlePaste); };
  }, [handlePaste]);

  const renderImageList = (imageList: ProductImage[], title: string) => (
    <div>
      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-gray-600" /> {title} <span className="text-xs text-gray-500">({imageList.length})</span>
      </h4>
      <div className="space-y-2 p-2 border rounded-md bg-gray-50/50 min-h-[5rem]">
        {imageList.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">ยังไม่มีรูปภาพ</p>
        ) : (
          imageList.map((img) => (
            <div key={img.id} className="flex gap-3 p-2 items-center bg-white border rounded-md shadow-sm">
              <img src={img.image_url} alt={img.variant_name || "Product Image"} className="w-16 h-16 object-cover rounded border" />
              {/* --- FIX: UI for long URL --- */}
              <div className="flex-1 min-w-0"> 
                <p className="text-xs text-gray-500 truncate">{img.image_url}</p>
                {img.variant_id && (<span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{img.variant_name}</span>)}
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 self-center text-red-500 hover:text-red-600" onClick={() => handleDeleteImage(img.id!)} disabled={isUpdating || disabled}><X className="w-4 h-4" /></Button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="border-gray-200">
        <CardHeader><CardTitle className="text-base">เพิ่มรูปภาพใหม่</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>1. เลือกประเภทรูปภาพ</Label>
              <Select value={selectedImageType} onValueChange={(value: any) => setSelectedImageType(value)} disabled={disabled || isUpdating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">🖼️ รูปภาพหลัก</SelectItem>
                  <SelectItem value="additional">📸 รูปภาพเพิ่มเติม</SelectItem>
                  <SelectItem value="variant">🧩 รูปภาพของตัวเลือก</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedImageType === 'variant' && (
              <div>
                <Label>2. สำหรับตัวเลือกสินค้า</Label>
                <Select value={selectedVariant} onValueChange={setSelectedVariant} disabled={disabled || isUpdating || productOptions.length === 0}>
                  <SelectTrigger><SelectValue placeholder="เลือกตัวเลือกสินค้า..." /></SelectTrigger>
                  <SelectContent>
                    {productOptions.map((option) => (<SelectItem key={option.id} value={option.id!}>{option.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div>
            <Label>3. อัปโหลด, Paste, หรือใส่ URL</Label>
            <Input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => addImage("", e.target.files?.[0])} />
            <div className="flex gap-2 mt-1">
              <Button onClick={() => fileInputRef.current?.click()} disabled={disabled || isUpdating} variant="outline"><Upload className="w-4 h-4 mr-2"/> เลือกไฟล์</Button>
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="หรือใส่ URL รูปภาพ แล้วกดบวก" disabled={disabled || isUpdating} />
              <Button onClick={() => addImage(newImageUrl)} disabled={disabled || isUpdating || !newImageUrl.trim()}><Plus className="w-4 h-4" /></Button>
            </div>
             <p className="text-sm text-gray-500 mt-2">💡 เคล็ดลับ: Paste รูปจาก clipboard ได้เลย (Ctrl+V)</p>
          </div>
        </CardContent>
      </Card>
      <Separator />
      <div className="space-y-4">
        {renderImageList([mainImage].filter(Boolean) as ProductImage[], "รูปภาพหลัก")}
        {renderImageList(additionalImages, "รูปภาพเพิ่มเติม")}
        {productOptions.length > 0 && renderImageList(variantImages, "รูปภาพของตัวเลือกสินค้า")}
      </div>
    </div>
  );
};

export default ProductImageManager;
