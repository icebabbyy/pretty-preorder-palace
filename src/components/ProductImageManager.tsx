// อัปเดตโค้ดใน ProductImageManager.tsx ให้รองรับ paste image
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { 
  fetchProductImages, 
  addProductImage, 
  deleteProductImage, 
  updateProductImage,
  reorderProductImages,
  type ProductImage 
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
  disabled = false 
}: ProductImageManagerProps) => {
  const [images, setImages] = useState<ProductImage[]>(initialImages || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const fileItem = Array.from(items).find(item => item.type.indexOf("image") === 0);
      if (!fileItem) return;

      const file = fileItem.getAsFile();
      if (!file || !productId) return;

      const fileName = `pasted-${productId}-${Date.now()}.png`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file);

      if (error) {
        alert("ไม่สามารถอัปโหลดรูปได้");
        console.error(error);
        return;
      }

      const publicUrl = supabase.storage.from("product-images").getPublicUrl(fileName).data.publicUrl;

      const newImage: ProductImage = {
        id: Date.now(),
        image_url: publicUrl,
        product_id: productId,
        order: images.length + 1,
        created_at: new Date().toISOString()
      };

      setImages(prev => {
        const updated = [...prev, newImage];
        onImagesChange(updated);
        return updated;
      });
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [images, productId]);

  // ... [ส่วนที่เหลือเหมือนเดิม ไม่ต้องแก้]

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">รูปภาพสินค้า (สามารถ Paste รูปได้)</Label>
      {/* ส่วน input/add image เหมือนเดิม */}
      {/* ส่วนแสดงรูปภาพเหมือนเดิม */}
    </div>
  );
};

export default ProductImageManager;
