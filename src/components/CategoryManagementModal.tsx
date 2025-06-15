
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { addCategory, deleteCategory } from "@/utils/supabase";

interface CategoryManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategoryManagementModal = ({ open, onOpenChange, categories, setCategories }: CategoryManagementModalProps) => {
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const addCategoryHandler = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setLoading(true);
    try {
      await addCategory(trimmed);
      setCategories([...categories, trimmed]);
      setNewCategory("");
    } catch (e) {
      alert("ไม่สามารถเพิ่มหมวดหมู่ได้");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategoryHandler = async (categoryToDelete: string) => {
    setLoading(true);
    try {
      await deleteCategory(categoryToDelete);
      setCategories(categories.filter(cat => cat !== categoryToDelete));
    } catch (e) {
      alert("ไม่สามารถลบหมวดหมู่นี้ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-2 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-800">จัดการหมวดหมู่</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div>
            <Label htmlFor="newCategory">เพิ่มหมวดหมู่ใหม่</Label>
            <div className="flex gap-2 mt-2">
              <Input 
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="ชื่อหมวดหมู่"
                className="border-2 border-gray-300"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') addCategoryHandler();
                }}
                disabled={loading}
              />
              <Button 
                onClick={addCategoryHandler}
                className="bg-gray-800 hover:bg-gray-700 text-white"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>หมวดหมู่ที่มีอยู่</Label>
            <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-300">
                  <span className="text-gray-800">{category}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600"
                    onClick={() => deleteCategoryHandler(category)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-300">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-2 border-gray-800 hover:bg-gray-100"
            disabled={loading}
          >
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagementModal;
