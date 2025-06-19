import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, ArrowUp, ArrowDown } from "lucide-react";
import {
  addProductImage,
  deleteProductImage,
  reorderProductImages,
  updateProductImage,
  type ProductImage,
} from "@/utils/productImages";
import { supabase } from "@/integrations/supabase/client";

interface ProductImageManagerProps {
  productId?: number;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  disabled?: boolean;
}

const ProductImageManager = ({
  productId,
  images: initialImages,
  onImagesChange,
  disabled = false,
}: ProductImageManagerProps) => {
  const [images, setImages] = useState<ProductImage[]>(initialImages || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    const filename = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(filename, file);
    if (error) return null;
    const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
    return data.publicUrl;
  };

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          const url = await uploadImageToStorage(file);
          if (url) await addImage(url);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste as any);
    return () => window.removeEventListener("paste", handlePaste as any);
  }, []);

  const addImage = async (url: string) => {
    if (!url.trim()) return;
    if (productId) {
      const newImage = await addProductImage(productId, url.trim());
      const updated = [...images, newImage];
      setImages(updated);
      onImagesChange(updated);
    }
  };

  const handleDeleteImage = async (imageId: number, index: number) => {
    if (productId && imageId > 1000) {
      await deleteProductImage(imageId);
    }
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated);
  };

  const handleMoveImage = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
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
  };

  const handleImageUrlChange = async (index: number, newUrl: string) => {
    const updated = [...images];
    updated[index].image_url = newUrl;
    setImages(updated);
    onImagesChange(updated);
    if (productId && updated[index].id > 1000) {
      await updateProductImage(updated[index].id, { image_url: newUrl });
    }
  };

  return (
    <div className="space-y-4">
      <Label>จัดการรูปภาพสินค้า</Label>
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = await uploadImageToStorage(file);
            if (url) await addImage(url);
          }
        }}
      />
      <Button onClick={() => fileInputRef.current?.click()} disabled={disabled}>
        เพิ่มรูปภาพ
      </Button>
      <div className="grid gap-3">
        {images.map((img, index) => (
          <Card key={img.id} className="border">
            <CardContent className="flex gap-3 p-3 items-center">
              <img
                src={img.image_url}
                alt=""
                className="w-16 h-16 object-cover rounded border"
              />
              <Input
                value={img.image_url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMoveImage(index, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMoveImage(index, "down")}
                  disabled={index === images.length - 1}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteImage(img.id, index)}
                  className="text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {index === 0 && (
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                  รูปหลัก
                </span>
              )}
            </CardContent>
          </Card>
        ))}
        {images.length === 0 && <p className="text-center text-gray-500">ยังไม่มีรูปภาพสินค้า</p>}
      </div>
    </div>
  );
};

export default ProductImageManager;
