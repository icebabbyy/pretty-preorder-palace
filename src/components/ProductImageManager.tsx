
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
import { uploadImageToStorage, deleteProductImage } from "@/utils/productImages";

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

const ProductImageManager = ({ images, onImagesChange, disabled, productId }: ProductImageManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = (newImage: ProductImage) => {
    onImagesChange([...images, newImage]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUpdating(true);
    try {
      const url = await uploadImageToStorage(file, productId || nanoid(), "extra");
      if (url) {
        handleAddImage({ id: nanoid(), image_url: url, order: images.length, file });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUpdating(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const handleAddFromUrl = () => {
    if (!newImageUrl.trim()) return;
    handleAddImage({ id: nanoid(), image_url: newImageUrl.trim(), order: images.length });
    setNewImageUrl("");
  };

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (isUpdating || disabled) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          setIsUpdating(true);
          try {
            const url = await uploadImageToStorage(file, productId || nanoid(), "extra");
            if (url) {
              handleAddImage({ id: nanoid(), image_url: url, order: images.length, file });
            }
          } catch (error) {
            console.error("Error uploading pasted image:", error);
          } finally {
            setIsUpdating(false);
          }
          break;
        }
      }
    }
  }, [isUpdating, disabled, images, onImagesChange, productId]);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => { window.removeEventListener("paste", handlePaste); };
  }, [handlePaste]);

  const handleRemoveImage = async (indexToRemove: number) => {
    if (disabled || isUpdating) return;

    const imageToDelete = images[indexToRemove];
    if (!imageToDelete) return;

    try {
      setIsUpdating(true);
      
      // อัปเดต UI ทันที (Optimistic Update)
      const updatedImages = images.filter((_, index) => index !== indexToRemove);
      onImagesChange(updatedImages);

      // ถ้ารูปนี้มี ID ที่เป็นตัวเลข (มาจาก database) ให้ลบจาก database
      if (typeof imageToDelete.id === 'number' && imageToDelete.id > 0) {
        console.log(`Deleting image with DB ID: ${imageToDelete.id}`);
        await deleteProductImage(imageToDelete.id);
        console.log(`Successfully deleted image with ID: ${imageToDelete.id}`);
      }
      
    } catch (error) {
      console.error("Failed to delete image:", error);
      // ถ้าลบไม่สำเร็จ ให้คืนรูปกลับมา
      onImagesChange(images);
      alert("เกิดข้อผิดพลาดในการลบรูปภาพ");
    } finally {
      setIsUpdating(false);
    }
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
                disabled={isUpdating || disabled}
              />
            ))}
             {images.length === 0 && <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีรูปภาพ</p>}
          </div>
          {!disabled && (
            <div className="flex flex-col gap-3 pt-4 border-t">
               <Label className="text-sm font-medium">เพิ่มรูปภาพใหม่</Label>
               <div className="flex gap-2 items-center">
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isUpdating} variant="outline" className="flex-shrink-0">
                    <Upload className="w-4 h-4 mr-2"/>
                    {isUpdating ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
                  </Button>
                  <span className="text-sm text-gray-500">หรือ</span>
                  <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="ใส่ URL รูปภาพ แล้วกดบวก" disabled={isUpdating} />
                  <Button onClick={handleAddFromUrl} disabled={isUpdating || !newImageUrl.trim()} size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
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
