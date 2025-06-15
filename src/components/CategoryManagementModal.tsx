import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

interface CategoryManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  setCategories: (categories: string[]) => void;
}

const CategoryManagementModal = ({
  open,
  onOpenChange,
  categories,
  setCategories
}: CategoryManagementModalProps) => {
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(cat => cat !== category));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-purple-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg text-purple-800">จัดการหมวดหมู่สินค้า</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <Input
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="เพิ่มหมวดหมู่ใหม่"
              className="border border-purple-200 rounded-lg"
            />
            <Button
              onClick={handleAddCategory}
              className="bg-purple-500 text-white rounded-lg"
              disabled={!newCategory || categories.includes(newCategory)}
            >
              <Plus className="w-4 h-4" />
              เพิ่ม
            </Button>
          </div>
          <div>
            <ul className="divide-y divide-purple-100">
              {categories.map((category, idx) => (
                <li key={category} className="flex items-center justify-between py-2">
                  <span>{category}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => handleRemoveCategory(category)}
                    disabled={categories.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagementModal;
