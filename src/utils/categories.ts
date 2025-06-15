
import { supabase } from "@/integrations/supabase/client";

// หมวดหมู่
export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name", { ascending: true });
  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
  return (data ?? []).map((row: any) => row.name);
}

export async function addCategory(categoryName: string): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .insert([{ name: categoryName }]);
  if (error) {
    if (error.code !== "23505") {
      console.error("Error adding category:", error);
      throw new Error("Failed to add category");
    }
  }
}

export async function deleteCategory(categoryName: string): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("name", categoryName);
  if (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}
