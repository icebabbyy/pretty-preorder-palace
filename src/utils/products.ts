
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types";
import { fetchProductImages, addProductImage, deleteProductImage, type ProductImage } from "./productImages";

// Helper: snake_case to camelCase
async function supabaseProductToProduct(p: any): Promise<Product> {
  // Fetch product images from product_images table
  let productImages: ProductImage[] = [];
  try {
    productImages = await fetchProductImages(p.id);
  } catch (error) {
    console.warn('Failed to fetch product images for product', p.id, error);
  }

  // Use first image from product_images table, fallback to existing image field
  const mainImage = productImages.length > 0 ? productImages[0].image_url : (p.image || "");

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category || "",
    categories: p.category ? [p.category] : [],
    productType: p.product_type || "",
    image: mainImage,
    images: productImages, // Add all images array
    priceYuan: p.price_yuan ?? 0,
    exchangeRate: p.exchange_rate ?? 5,
    priceThb: (p.price_yuan ?? 0) * (p.exchange_rate ?? 1),
    importCost: p.import_cost ?? 0,
    costThb: p.cost_thb ?? 0,
    sellingPrice: p.selling_price ?? 0,
    status: p.product_status || "",
    shipmentDate: p.shipment_date ? p.shipment_date.toString() : "",
    link: p.link || "",
    description: p.description || "",
    quantity: p.quantity ?? 0,
    options: p.options ?? [],
  };
}

// Helper: camelCase to snake_case for insert
function productToSupabaseInsert(product: Omit<Product, "id"> | Product) {
  // Ensure quantity is always a valid number, never null or undefined
  const quantity = typeof product.quantity === "number" && !isNaN(product.quantity) 
    ? product.quantity 
    : 0;

  // Use the first category from categories array, or fall back to category field
  const category = product.categories && product.categories.length > 0 
    ? product.categories[0] 
    : product.category || "";

  return {
    sku: product.sku,
    name: product.name,
    category: category, // Only use single category field that exists in DB
    product_type: product.productType || null,
    image: product.image,
    price_yuan: product.priceYuan,
    exchange_rate: product.exchangeRate,
    import_cost: product.importCost,
    cost_thb: product.costThb,
    selling_price: product.sellingPrice,
    product_status: product.status, // Use product_status column
    shipment_date:
      product.shipmentDate && product.shipmentDate !== ""
        ? product.shipmentDate
        : null,
    link: product.link,
    description: product.description,
    quantity: quantity,
    options: product.options ? (product.options as any) : undefined,
  };
}

// Helper function to sync product option images to product_images table
async function syncProductOptionImages(productId: number, options: any[]) {
  if (!options || options.length === 0) return;

  try {
    // Sync each option's image to product_images table
    for (const option of options) {
      if (option.image && option.image !== '') {
        console.log(`Syncing image for option ${option.name}:`, option.image);
        
        // Check if this variant image already exists
        const { data: existingImages } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', productId)
          .eq('variant_id', option.id);

        if (!existingImages || existingImages.length === 0) {
          // Add new image for this variant
          await addProductImage(
            productId,
            option.image,
            undefined, // Let it auto-determine order
            option.id,
            option.name
          );
          console.log(`Added image for variant ${option.name}`);
        } else {
          // Update existing image if URL has changed
          const existingImage = existingImages[0];
          if (existingImage.image_url !== option.image) {
            const { error } = await supabase
              .from('product_images')
              .update({ 
                image_url: option.image,
                variant_name: option.name // Update variant name too
              })
              .eq('id', existingImage.id);
            
            if (error) {
              console.error('Error updating variant image:', error);
            } else {
              console.log(`Updated image for variant ${option.name}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error syncing product option images:', error);
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }

  // Convert each product with images
  const products = await Promise.all(
    (data ?? []).map(supabaseProductToProduct)
  );

  return products;
}

export async function addProduct(product: Omit<Product, "id"> & { images?: ProductImage[] }): Promise<Product> {
  const obj = productToSupabaseInsert(product);
  console.log("addProduct: data to insert:", obj);

  // log ว่า fields สำคัญขาดหรือไม่
  ['sku', 'name', 'price_yuan', 'quantity'].forEach((key) => {
    if (!obj[key]) {
      console.warn(`Field "${key}" is missing or falsy in product insert!`);
    }
  });

  const { data, error } = await supabase
    .from('products')
    .insert([obj as any])
    .select()
    .single();
  if (error) {
    console.error('Error adding product:', error);
    alert(
      'Failed to add product: ' +
      (error.message || '') +
      (error.details ? '\nDetails: ' + error.details : '')
    );
    throw new Error('Failed to add product');
  }

  // If there are images to add, add them to product_images table
  if (product.images && product.images.length > 0) {
    try {
      for (let i = 0; i < product.images.length; i++) {
        const image = product.images[i];
        await addProductImage(
          data.id, 
          image.image_url, 
          i + 1, 
          image.variant_id || undefined, 
          image.variant_name || undefined
        );
      }
    } catch (error) {
      console.error('Error adding product images:', error);
      // Don't throw error here, product is already created
    }
  }

  // Sync product option images to product_images table
  if (product.options && product.options.length > 0) {
    await syncProductOptionImages(data.id, product.options);
  }

  return await supabaseProductToProduct(data);
}

export async function updateProduct(product: Product & { images?: ProductImage[] }): Promise<Product> {
  const obj = productToSupabaseInsert(product);
  console.log("updateProduct: data to update:", obj, "ID:", product.id);
  
  const { data, error } = await supabase
    .from('products')
    .update({ ...obj, updated_at: new Date().toISOString() } as any)
    .eq('id', product.id)
    .select()
    .single();
  if (error) {
    console.error('Error updating product:', error);
    alert(
      'Failed to update product: ' +
      (error.message || '') +
      (error.details ? '\nDetails: ' + error.details : '')
    );
    throw new Error('Failed to update product');
  }

  // Sync product option images to product_images table after update
  if (product.options && product.options.length > 0) {
    await syncProductOptionImages(product.id!, product.options);
  }

  // Note: Image management is handled separately by ProductImageManager
  // so we don't need to update images here
  
  return await supabaseProductToProduct(data);
}

export async function deleteProduct(productId: number): Promise<void> {
  console.log('Deleting product ID:', productId);
  
  try {
    // First, delete all related product images
    const { error: imagesError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);
    
    if (imagesError) {
      console.error('Error deleting product images:', imagesError);
      throw new Error('Failed to delete product images: ' + imagesError.message);
    }
    
    // Then delete the product
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
      
    if (productError) {
      console.error('Error deleting product:', productError);
      throw new Error('Failed to delete product: ' + productError.message);
    }
    
    console.log('Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
}
