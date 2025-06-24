// src/components/ProductImageManager.tsx

import { useEffect, useRef, useState, useCallback } from "react";
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
} from "@/utils/productImages";
import { supabase } from "@/integrations/supabase/client";
import { ProductOption, ProductImage } from "@/types";
import { nanoid } from "nanoid";

// เพิ่ม Dnd Provider กลับมา
import { DndProvider, useDrag, useDrop, XYCoord } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { cn } from '@/lib/utils';

// --- เอากลับมา: Component สำหรับรูปภาพที่ลากวางได้ ---
interface DraggableImageProps {
  image: ProductImage;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
}

const DraggableImage = ({ image, index, moveImage, onRemove, disabled }: DraggableImageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: 'image',
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: () => ({ id: image.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(drop(ref));

  return (
    <div ref={ref} data-handler-id={handlerId} style={{ opacity: isDragging ? 0.5 : 1 }} className="relative p-2 border rounded-lg bg-white flex items-center gap-3 cursor-move">
      <img src={image.image_url} alt={`Product image ${index + 1}`} className="w-16 h-16 object-cover rounded-md" />
      <div className="flex-grow text-xs text-gray-500 truncate">{image.image_url}</div>
      {!disabled && (
        <Button variant="destructive" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => onRemove(index)}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};


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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- แก้ไข: ลบ State ที่ไม่จำเป็นออก เพื่อให้ Parent เป็นคนควบคุมข้อมูลทั้งหมด ---

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const filename = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from("product-images").upload(filename, file);
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      return supabase.storage.from("product-images").getPublicUrl(filename).data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUpdating(true);
    const url = await uploadImageToStorage(file);
    if (url) {
      const newImage: ProductImage = { id: nanoid(), image_url: url, order: initialImages.length, file };
      onImagesChange([...initialImages, newImage]);
    }
    setIsUpdating(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleAddFromUrl = () => {
    if (!newImageUrl.trim()) return;
    const newImage: ProductImage = { id: nanoid(), image_url: newImageUrl.trim(), order: initialImages.length };
    onImagesChange([...initialImages, newImage]);
    setNewImageUrl("");
  };

  // --- แก้ไข: แก้ Paste ให้ทำงานได้ถูกต้อง ---
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (isUpdating) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          setIsUpdating(true);
          const url = await uploadImageToStorage(file);
          if (url) {
            const newImage: ProductImage = { id: nanoid(), image_url: url, order: initialImages.length, file };
            onImagesChange([...initialImages, newImage]);
          }
          setIsUpdating(false);
          break;
        }
      }
    }
  }, [isUpdating, initialImages, onImagesChange]); // อัปเดต dependencies ให้ถูกต้อง

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]); // ให้ re-bind event listener เมื่อ handlePaste function เปลี่ยน

  // --- แก้ไข: แก้ไขฟังก์ชันลบรูปให้ทำงานกับ index ---
  const handleRemoveImage = (indexToRemove: number) => {
    if (disabled) return;
    // ใช้ onImagesChange เพื่อส่งข้อมูลกลับไปให้ Parent จัดการ
    const updatedImages = initialImages.filter((_, index) => index !== indexToRemove);
    onImagesChange(updatedImages);
  };
  
  // --- เอากลับมา: ฟังก์ชันสำหรับลากวาง ---
  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = initialImages[dragIndex];
    const updatedImages = [...initialImages];
    updatedImages.splice(dragIndex, 1);
    updatedImages.splice(hoverIndex, 0, draggedImage);
    onImagesChange(updatedImages);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Card>
        <CardHeader><CardTitle className="text-base">จัดการรูปภาพสินค้า</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {initialImages.map((img, index) => (
              <DraggableImage
                key={img.id || index}
                index={index}
                image={img}
                moveImage={moveImage}
                onRemove={handleRemoveImage}
                disabled={disabled}
              />
            ))}
             {initialImages.length === 0 && <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีรูปภาพ</p>}
          </div>
          {!disabled && (
            <div className="flex flex-col gap-4 pt-4 border-t">
               <Label className="text-sm font-medium">เพิ่มรูปภาพใหม่</Label>
               <div className="flex gap-2 items-center">
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isUpdating} variant="outline" className="flex-shrink-0">
                    <Upload className="w-4 h-4 mr-2"/>
                    {isUpdating ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
                  </Button>
                  <span className="text-sm text-gray-500">หรือ</span>
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="ใส่ URL รูปภาพ แล้วกดบวก"
                    disabled={isUpdating}
                  />
                  <Button onClick={handleAddFromUrl} disabled={isUpdating || !newImageUrl.trim()} size="icon" className="flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
               </div>
                <p className="text-sm text-gray-500">
                  💡 เคล็ดลับ: คุณสามารถ Paste รูปภาพจาก clipboard ได้โดยตรง (Ctrl+V)
                </p>
               <Input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
          )}
        </CardContent>
      </Card>
    </DndProvider>
  );
};

export default ProductImageManager;
