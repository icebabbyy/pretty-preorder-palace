
import { supabase } from "@/integrations/supabase/client";
import { ProductImage } from "@/types";

// Fetch all images for a product
export async function fetchProductImages(productId: number): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching product images:', error);
    throw new Error('Failed to fetch product images');
  }

  return data || [];
}

// Add a new image to a product
export async function addProductImage(
  productId: number, 
  imageUrl: string, 
  order?: number,
  variantId?: string,
  variantName?: string
): Promise<ProductImage> {
  // If no order specified, get the next order number
  if (order === undefined) {
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('order')
      .eq('product_id', productId)
      .order('order', { ascending: false })
      .limit(1);
    
    order = existingImages && existingImages.length > 0 ? existingImages[0].order + 1 : 1;
  }

  const { data, error } = await supabase
    .from('product_images')
    .insert([{
      product_id: productId,
      image_url: imageUrl,
      order: order,
      variant_id: variantId || null,
      variant_name: variantName || null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding product image:', error);
    throw new Error('Failed to add product image');
  }

  return data;
}

// Update image order or URL
export async function updateProductImage(
  imageId: number, 
  updates: { 
    image_url?: string; 
    order?: number;
    variant_id?: string | null;
    variant_name?: string | null;
  }
): Promise<ProductImage> {
  const { data, error } = await supabase
    .from('product_images')
    .update(updates)
    .eq('id', imageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product image:', error);
    throw new Error('Failed to update product image');
  }

  return data;
}

// Delete a product image
export async function deleteProductImage(imageId: number): Promise<void> {
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    console.error('Error deleting product image:', error);
    throw new Error('Failed to delete product image');
  }
}

// Update the order of multiple images
export async function reorderProductImages(
  imageUpdates: { id: number; order: number }[]
): Promise<void> {
  const promises = imageUpdates.map(({ id, order }) =>
    supabase
      .from('product_images')
      .update({ order })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  
  for (const result of results) {
    if (result.error) {
      console.error('Error reordering product images:', result.error);
      throw new Error('Failed to reorder product images');
    }
  }
}

export const uploadImageToStorage = async (
  file: File,
  pathPrefix: string // เราจะรับ pathPrefix ซึ่งก็คือ ID ของสินค้า
): Promise<string | null> => {
  try {
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน โดยใช้ timestamp + ชื่อไฟล์เดิม
    const filename = `${Date.now()}_${file.name}`;
    
    // สร้างเส้นทางเก็บไฟล์ที่สมบูรณ์ตามที่เราต้องการ: {product_id}/{filename}
    const filePath = `${pathPrefix}/${filename}`;

    const { data, error } = await supabase
      .storage
      .from("product-images") // ชื่อ bucket ของเรา
      .upload(filePath, file, { // ใช้ filePath ที่เราสร้างขึ้น
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // ถ้าเกิด error ให้โยน error ออกไปเพื่อให้ catch ด้านนอกจัดการ
      throw error;
    }

    // ดึง URL สาธารณะของไฟล์ที่เพิ่งอัปโหลดเสร็จ
    const { data: publicUrlData } = supabase
      .storage
      .from("product-images")
      .getPublicUrl(filePath); // ใช้ filePath เดิม

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("Upload Error:", error);
    return null; // คืนค่า null ถ้ามีข้อผิดพลาด
  }
};

    const { data } = supabase
      .storage
      .from("product-images")
      .getPublicUrl(path);
      
    return data.publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}
