
import { supabase } from "@/integrations/supabase/client";

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  order: number;
  created_at: string;
  variant_id?: string | null;
  variant_name?: string | null;
  type: string;
  index?: number;
}

// Fetch all images for a product
export async function fetchProductImages(productId: number): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('type', { ascending: true })
    .order('index', { ascending: true });

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
  index?: number,
  variantId?: string,
  variantName?: string,
  type: string = 'extra'
): Promise<ProductImage> {
  // If no index specified, get the next index number for this type
  if (index === undefined) {
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('index')
      .eq('product_id', productId)
      .eq('type', type)
      .order('index', { ascending: false })
      .limit(1);
    
    index = existingImages && existingImages.length > 0 ? (existingImages[0].index || 0) + 1 : 0;
  }

  const { data, error } = await supabase
    .from('product_images')
    .insert([{
      product_id: productId,
      image_url: imageUrl,
      order: index || 0,
      index: index || 0,
      variant_id: variantId || null,
      variant_name: variantName || null,
      type: type
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
    index?: number;
    variant_id?: string | null;
    variant_name?: string | null;
    type?: string;
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
      .update({ order, index: order })
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
