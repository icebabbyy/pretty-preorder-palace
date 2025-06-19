
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

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return;
    
    if (productId) {
      // Product exists, save to database
      setLoading(true);
      try {
        const newImage = await addProductImage(productId, newImageUrl.trim());
        const updatedImages = [...images, newImage];
        setImages(updatedImages);
        onImagesChange(updatedImages);
        setNewImageUrl("");
      } catch (error) {
        console.error("Failed to add image:", error);
        alert("ไม่สามารถเพิ่มรูปภาพได้");
      } finally {
        setLoading(false);
      }
    } else {
      // New product, just add to local state
      const newImage: ProductImage = {
        id: Date.now(), // Temporary ID
        product_id: 0,
        image_url: newImageUrl.trim(),
        order: images.length + 1,
        created_at: new Date().toISOString()
      };
      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      setNewImageUrl("");
    }
  };

  const handleDeleteImage = async (imageId: number, index: number) => {
    if (productId && imageId > 1000) { // Real ID from database
      setLoading(true);
      try {
        await deleteProductImage(imageId);
      } catch (error) {
        console.error("Failed to delete image:", error);
        alert("ไม่สามารถลบรูปภาพได้");
        return;
      } finally {
        setLoading(false);
      }
    }
    
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    // Update order values
    newImages.forEach((img, idx) => {
      img.order = idx + 1;
    });

    setImages(newImages);
    onImagesChange(newImages);

    // If product exists, update database
    if (productId) {
      try {
        const updates = newImages.map((img, idx) => ({
          id: img.id,
          order: idx + 1
        }));
        await reorderProductImages(updates);
      } catch (error) {
        console.error("Failed to reorder images:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">รูปภาพสินค้า</Label>
      
      {/* Add new image */}
      <div className="flex gap-2">
        <Input
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          placeholder="https://... (URL รูปภาพ)"
          className="flex-1 border border-purple-200 rounded-lg"
          disabled={disabled || loading}
        />
        <Button 
          onClick={handleAddImage}
          disabled={disabled || loading || !newImageUrl.trim()}
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Image list */}
      <div className="grid grid-cols-1 gap-3">
        {images.map((image, index) => (
          <Card key={`${image.id}-${index}`} className="border border-purple-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {/* Image preview */}
                <div className="flex-shrink-0">
                  <img
                    src={image.image_url}
                    alt={`Product image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 
                        "https://ui-avatars.com/api/?name=No+Image";
                    }}
                  />
                </div>

                {/* Image URL */}
                <div className="flex-1 min-w-0">
                  <Input
                    value={image.image_url}
                    onChange={(e) => {
                      const updatedImages = [...images];
                      updatedImages[index] = { ...image, image_url: e.target.value };
                      setImages(updatedImages);
                      onImagesChange(updatedImages);
                    }}
                    className="text-sm border border-purple-200 rounded"
                    disabled={disabled}
                  />
                </div>

                {/* Controls */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveImage(index, 'up')}
                    disabled={disabled || index === 0}
                    className="text-purple-600 hover:bg-purple-50"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveImage(index, 'down')}
                    disabled={disabled || index === images.length - 1}
                    className="text-purple-600 hover:bg-purple-50"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteImage(image.id, index)}
                    disabled={disabled || loading}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {index === 0 && (
                <div className="mt-2">
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    รูปหลัก
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          ยังไม่มีรูปภาพสินค้า
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
