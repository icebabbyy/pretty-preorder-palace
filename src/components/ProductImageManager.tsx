// src/components/ProductImageManager.tsx

import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Upload } from "lucide-react";
import { ProductImage, ProductOption } from "@/types";
import { nanoid } from "nanoid";
import { DndProvider, useDrag, useDrop, XYCoord } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { cn } from '@/lib/utils';
// ไม่จำเป็นต้อง import uploader ที่นี่แล้ว เพราะ Parent จะเป็นคนจัดการ
// import { uploadImageToStorage, deleteProductImage } from "@/utils/productImages"; 

// DraggableImage Component (เหมือนเดิม ไม่แก้ไข)
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
    collect(monitor) { return { handlerId: monitor.getHandlerId() }; },
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
    <div ref={ref} data-handler-id={handlerId} className={cn("relative p-2 border rounded-lg bg-white flex items-center gap-3 cursor-move", isDragging ? "opacity-50" : "opacity-100")}>
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
  productId?: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  disabled: boolean;
  productOptions: ProductOption[];
}

const ProductImageManager = ({ images, onImagesChange, disabled }: ProductImageManagerProps) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ฟังก์ชันกลางสำหรับเพิ่มรูปเข้ารายการ (ยังไม่อัปโหลด)
  const addImageToList = (newImage: ProductImage) => {
    onImagesChange([...images, newImage]);
  };

  // 1. แก้ไข handleFileChange ให้เพิ่มไฟล์เข้ารายการเฉยๆ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addImageToList({
      id: nanoid(),
      image_url: URL.createObjectURL(file), // สร้าง URL ชั่วคราวสำหรับ Preview
      order: images.length,
      file: file // แนบไฟล์จริงไปด้วย
    });
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  // 2. แก้ไข handleAddFromUrl ให้เพิ่ม URL เข้ารายการเฉยๆ
  const handleAddFromUrl = () => {
    if (!newImageUrl.trim()) return;
    addImageToList({
      id: nanoid(),
      image_url: newImageUrl.trim(),
      order: images.length
    });
    setNewImageUrl("");
  };

  // 3. แก้ไข handlePaste ให้ทำงานเหมือน handleFileChange
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (disabled) return;
    const file = e.clipboardData?.items[0]?.getAsFile();
    if (file && file.type.startsWith("image/")) {
      e.preventDefault();
      addImageToList({
        id: nanoid(),
        image_url: URL.createObjectURL(file),
        order: images.length,
        file: file
      });
    }
  }, [disabled, images, onImagesChange]); // อัปเดต dependencies

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => { window.removeEventListener("paste", handlePaste); };
  }, [handlePaste]);

  const handleRemoveImage = (indexToRemove: number) => {
    if (disabled) return;
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(updatedImages);
  };
  
  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = images[dragIndex];
    const updatedImages = [...images];
    updatedImages.splice(dragIndex, 1);
    updatedImages.splice(hoverIndex, 0, draggedImage);
    onImagesChange(updatedImages);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Card>
        <CardHeader><CardTitle className="text-base">จัดการรูปภาพสินค้า</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 min-h-[5rem] bg-gray-50/50 p-2 rounded-md border">
            {images.map((img, index) => (
              <DraggableImage
                key={img.id || index}
                index={index}
                image={img}
                moveImage={moveImage}
                onRemove={handleRemoveImage}
                disabled={disabled}
              />
            ))}
             {images.length === 0 && <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีรูปภาพ (ลากวาง, Paste, หรือเพิ่มจาก URL)</p>}
          </div>
          {!disabled && (
            <div className="flex flex-col gap-3 pt-4 border-t">
               <Label className="text-sm font-medium">เพิ่มรูปภาพใหม่</Label>
               <div className="flex gap-2 items-center">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-shrink-0">
                    <Upload className="w-4 h-4 mr-2"/>
                    เลือกไฟล์
                  </Button>
                  <span className="text-sm text-gray-500">หรือ</span>
                  <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="ใส่ URL รูปภาพ แล้วกดบวก" />
                  <Button onClick={handleAddFromUrl} disabled={!newImageUrl.trim()} size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
               </div>
                <p className="text-sm text-gray-500">💡 เคล็ดลับ: คุณสามารถ Paste รูปภาพจาก clipboard ได้โดยตรง (Ctrl+V)</p>
               <Input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
          )}
        </CardContent>
      </Card>
    </DndProvider>
  );
};

export default ProductImageManager;
