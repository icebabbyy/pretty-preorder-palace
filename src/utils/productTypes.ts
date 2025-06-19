
import { supabase } from "@/integrations/supabase/client";

export async function fetchProductTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('product_types')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching product types:', error);
    throw new Error('Failed to fetch product types');
  }

  return (data ?? []).map(item => item.name);
}

export async function addProductType(name: string): Promise<void> {
  const { error } = await supabase
    .from('product_types')
    .insert([{ name }]);

  if (error) {
    console.error('Error adding product type:', error);
    throw new Error('Failed to add product type');
  }
}

export async function deleteProductType(name: string): Promise<void> {
  const { error } = await supabase
    .from('product_types')
    .delete()
    .eq('name', name);

  if (error) {
    console.error('Error deleting product type:', error);
    throw new Error('Failed to delete product type');
  }
}
