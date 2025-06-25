// src/components/ProductImageManager.tsx

import { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Upload, ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { nanoid } from "nanoid";
import type { ProductImage, ProductOption } from "@/types";

interface ProductImageManagerProps {
  productId?: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  disabled?: boolean;
  productOptions: ProductOption[];
}

const ProductImageManager = ({
  images,
  onImagesChange,
  disabled = false,
  productOptions = [],
}: ProductImageManagerProps) => {

  const [isUpdating, setIsUpdating] = useState(false); // ใช้สำหรับบล็อกปุ่มชั่วคราว
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedImageType, setSelectedImageType] = useState<"main" | "additional" | "variant">("main");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- แยกประเภทรูปเพื่อการแสดงผล ---
  const mainImage = images.find(img => img.order === 1 && !img.variant_id);
  const additionalImages = images.filter(img => img.order !== 1 && !img.variant_id).sort((a, b) => (a.order || 99) - (b.order || 99));
  const variantImages = images.filter(img => !!img.variant_id);

  // --- ฟังก์ชันหลักในการเพิ่มรูป (ยังไม่อัปโหลด) ---
  const addImageToList = (imageSource: { url?: string, file?: File }) => {
    if ((!imageSource.url && !imageSource.file) || isUpdating) return;
    if (selectedImageType === "variant" && !selectedVariant) {
      alert("กรุณาเลือกตัวเลือกสินค้าสำหรับรูปภาพนี้");
      return;
    }

    let newImageList = [...images];
    const newImage: ProductImage = {
      id: nanoid(), // ID ชั่วคราว
      image_url: imageSource.file ? URL.createObjectURL(imageSource.file) : imageSource.url!,
      order: 99,
      file: imageSource.file,
    };

    if (selectedImageType === "variant") {
      const variant = productOptions.find(opt => opt.id === selectedVariant);
      newImage.variant_id = variant?.id;
      newImage.variant_name = variant?.name;
      delete newImage.order;
    } else if (selectedImageType === "main") {
      newImage.order = 1;
      // ทำให้รูปหลักเดิม (ถ้ามี) กลายเป็นรูปเพิ่มเติม
      newImageList = newImageList.map(img => 
        img.order === 1 && !img.variant_id ? { ...img, order: 99 } : img
      );
    } else { // Additional
      const maxOrder = Math.max(1, ...newImageList.filter(img => !img.variant_id).map(img => img.order || 1));
      newImage.order = maxOrder + 1;
    }
    
    onImagesChange([...newImageList, newImage]);
    setNewImageUrl("");
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (disabled || isUpdating) return;
    const file = e.clipboardData?.items[0]?.getAsFile();
    if (file && file.type.startsWith("image/")) {
      e.preventDefault();
      addImageToList({ file: file });
    }
  }, [disabled, isUpdating, images, selectedImageType, selectedVariant]); // dependencies ที่ถูกต้อง

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => { window.removeEventListener("paste", handlePaste); };
  }, [handlePaste]);

  const handleDeleteImage = (imageId: string | number) => {
    onImagesChange(images.filter(img => img.id !== imageId));
  };

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
              {/* --- แก้ไข UI: URL ยาวจะถูกตัดด้วย ... --- */}
              <div className="flex-1 min-w-0"> 
                <p className="text-xs text-gray-500 truncate" title={img.image_url}>{img.image_url}</p>
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
              <Select value={selectedImageType} onValueChange={(value: any) => setSelectedImageType(value)} disabled={disabled}>
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
                <Select value={selectedVariant} onValueChange={setSelectedVariant} disabled={disabled || productOptions.length === 0}>
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
            <Input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => addImageToList({ file: e.target.files?.[0] })} />
            <div className="flex gap-2 mt-1">
              <Button onClick={() => fileInputRef.current?.click()} disabled={disabled} variant="outline"><Upload className="w-4 h-4 mr-2"/> เลือกไฟล์</Button>
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="หรือใส่ URL รูปภาพ แล้วกดบวก" disabled={disabled} />
              <Button onClick={() => addImageToList({ url: newImageUrl })} disabled={disabled || !newImageUrl.trim()}><Plus className="w-4 h-4" /></Button>
            </div>
             <p className="text-sm text-gray-500 mt-2">💡 เคล็ดลับ: Paste รูปจาก clipboard ได้เลย (Ctrl+V)</p>
          </div>
        </CardContent>
      </Card>
      <Separator />
      <div className="space-y-4">
        {renderImageList(mainImage ? [mainImage] : [], "รูปภาพหลัก")}
        {renderImageList(additionalImages, "รูปภาพเพิ่มเติม")}
        {productOptions.length > 0 && renderImageList(variantImages, "รูปภาพของตัวเลือกสินค้า")}
      </div>
    </div>
  );
};

export default ProductImageManager;
