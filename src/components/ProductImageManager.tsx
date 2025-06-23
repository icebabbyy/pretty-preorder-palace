import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  addProductImage,
  deleteProductImage,
  reorderProductImages,
  updateProductImage,
  uploadImageToStorage,
} from "@/utils/productImages";
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
  const [images, setImages] = useState<ProductImage[]>(initialImages || []);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedImageType, setSelectedImageType] = useState<"main" | "additional" | "variant">("main");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

  const mainImages = images.filter(img => !img.variant_id && img.order === 1);
  const additionalImages = images.filter(img => !img.variant_id && (img.order || 0) > 1);
  const variantImages = images.filter(img => img.variant_id);

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || isUpdating) return;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file && productId) {
          setIsUpdating(true);
          const folder = selectedImageType === "main" ? "main" : selectedImageType === "variant" ? "variant" : "extra";
          const url = await uploadImageToStorage(file, productId, folder);
          if (url) {
            await addImageByType(url);
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
  }, [isUpdating, selectedImageType, selectedVariant]);

  const addImageByType = async (url: string) => {
    if (!url.trim() || isUpdating) return;
    try {
      setIsUpdating(true);
      let variantId: string | undefined;
      let variantName: string | undefined;
      let order: number | undefined;

      if (selectedImageType === "variant" && selectedVariant) {
        const selectedVariantOption = productOptions.find(opt => opt.id === selectedVariant);
        variantId = selectedVariant;
        variantName = selectedVariantOption?.name;
      } else if (selectedImageType === "main") {
        order = 1;
      } else if (selectedImageType === "additional") {
        const maxOrder = Math.max(...additionalImages.map(img => img.order || 0), 1);
        order = maxOrder + 1;
      }

      if (productId) {
        const newImage = await addProductImage(productId, url.trim(), order, variantId, variantName);
        const updated = [...images, newImage];
        setImages(updated);
        onImagesChange(updated);

        if (variantId && variantName) {
          await updateVariantImageInProduct(variantId, url.trim());
        }
      } else {
        const tempImage: ProductImage = {
          id: Date.now(),
          product_id: 0,
          image_url: url.trim(),
          order: order || images.length + 1,
          created_at: new Date().toISOString(),
          variant_id: variantId || null,
          variant_name: variantName || null
        };
        const updated = [...images, tempImage];
        setImages(updated);
        onImagesChange(updated);
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มรูปภาพ: ' + (error as any).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateVariantImageInProduct = async (variantId: string, imageUrl: string) => {
    if (!productId) return;
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('options')
        .eq('id', productId)
        .single();

      if (error || !product?.options) return;

      const updatedOptions = product.options.map((option: any) =>
        option.id === variantId ? { ...option, image: imageUrl } : option
      );

      await supabase
        .from('products')
        .update({ options: updatedOptions, updated_at: new Date().toISOString() })
        .eq('id', productId);
    } catch (error) {
      console.error('Error updating variant image:', error);
    }
  };

  const handleAddImageUrl = async () => {
    if (!newImageUrl.trim()) return;
    await addImageByType(newImageUrl);
    setNewImageUrl("");
    setSelectedVariant("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isUpdating || !productId) return;
    setIsUpdating(true);
    const folder = selectedImageType === "main" ? "main" : selectedImageType === "variant" ? "variant" : "extra";
    const url = await uploadImageToStorage(file, productId, folder);
    if (url) {
      await addImageByType(url);
    }
    setIsUpdating(false);
    setSelectedVariant("");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = async (imageId: number | undefined) => {
    if (isUpdating || !imageId) return;
    setIsUpdating(true);
    if (productId && imageId > 0) {
      await deleteProductImage(imageId);
    }
    const updated = images.filter(img => img.id !== imageId);
    setImages(updated);
    onImagesChange(updated);
    setIsUpdating(false);
  };

  const handleMoveImage = async (imageId: number | undefined, direction: "up" | "down", imageList: ProductImage[]) => {
    if (isUpdating || !imageId) return;
    const currentIndex = imageList.findIndex(img => img.id === imageId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= imageList.length) return;

    setIsUpdating(true);
    const reordered = [...imageList];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
    reordered.forEach((img, i) => (img.order = i + 1));

    const updatedAllImages = images.map(img => {
      const reorderedImg = reordered.find(r => r.id === img.id);
      return reorderedImg || img;
    });

    setImages(updatedAllImages);
    onImagesChange(updatedAllImages);

    if (productId) {
      await reorderProductImages(
        reordered.map((img) => ({ id: img.id || 0, order: img.order || 0 }))
      );
    }

    setIsUpdating(false);
  };

  const handleImageUrlChange = async (imageId: number | undefined, newUrl: string) => {
    if (isUpdating || !imageId) return;
    setIsUpdating(true);
    const updated = images.map(img => img.id === imageId ? { ...img, image_url: newUrl } : img);
    setImages(updated);
    onImagesChange(updated);
    if (productId && imageId > 0) {
      await updateProductImage(imageId, { image_url: newUrl });
    }
    setIsUpdating(false);
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
              <img src={img.image_url} alt="" className="w-16 h-16 object-cover rounded border" />
              <div className="flex-1 space-y-2">
                <Input value={img.image_url} onChange={(e) => handleImageUrlChange(img.id, e.target.value)} />
                {img.variant_id && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {img.variant_name}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleMoveImage(img.id, "up", imageList)} disabled={index === 0 || isUpdating}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleMoveImage(img.id, "down", imageList)} disabled={index === imageList.length - 1 || isUpdating}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteImage(img.id)} className="text-red-500" disabled={isUpdating}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Label className="text-lg font-semibold">จัดการรูปภาพสินค้า</Label>
      <Card className="border-purple-200">
        <CardHeader><CardTitle className="text-base">เพิ่มรูปภาพใหม่</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ประเภทรูปภาพ *</Label>
            <Select value={selectedImageType} onValueChange={setSelectedImageType}>
              <SelectTrigger><SelectValue placeholder="เลือกประเภทรูปภาพ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="main">🖼️ รูปภาพหลักของสินค้า</SelectItem>
                <SelectItem value="additional">📸 รูปภาพเพิ่มเติม</SelectItem>
                <SelectItem value="variant">🧩 รูปภาพของตัวเลือกสินค้า</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedImageType === "variant" && productOptions.length > 0 && (
            <div className="space-y-2">
              <Label>เลือกตัวเลือกสินค้า *</Label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger><SelectValue placeholder="เลือกตัวเลือกสินค้าที่ต้องการเพิ่มรูป" /></SelectTrigger>
                <SelectContent>
                  {productOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <div className="flex gap-2">
            <Button onClick={() => fileInputRef.current?.click()} disabled={disabled || isUpdating || (selectedImageType === "variant" && !selectedVariant)} variant="outline">
              {isUpdating ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
            </Button>
            <div className="flex-1 flex gap-2">
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="หรือใส่ URL รูปภาพ" />
              <Button onClick={handleAddImageUrl} disabled={disabled || isUpdating || !newImageUrl.trim() || (selectedImageType === "variant" && !selectedVariant)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">💡 เคล็ดลับ: คุณสามารถ Paste รูปภาพจาก clipboard ได้โดยตรง (Ctrl+V)</p>
        </CardContent>
      </Card>

      <Separator />
      <h3 className="text-lg font-semibold">รูปภาพที่มีอยู่</h3>
      {renderImageList(mainImages, "🖼️ รูปภาพหลักของสินค้า", "ยังไม่มีรูปภาพหลัก")}
      {renderImageList(additionalImages, "📸 รูปภาพเพิ่มเติม", "ยังไม่มีรูปภาพเพิ่มเติม")}
      {productOptions.length > 0 && renderImageList(variantImages, "🧩 รูปภาพตัวเลือกสินค้า", "ยังไม่มีรูปภาพตัวเลือกสินค้า")}
    </div>
  );
};

export default ProductImageManager;
