
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Product } from "@/types";

interface ProductCategorySelectorProps {
  categories: string[];
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
}

const ProductCategorySelector = ({ categories, selectedCategories, toggleCategory }: ProductCategorySelectorProps) => {
  return (
    <div>
      <Label>หมวดหมู่ * (เลือกได้หลายหมวดหมู่)</Label>
      <div className="mt-2 space-y-2">
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedCategories.map((cat) => (
              <Badge key={cat} variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                {cat}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-purple-200 rounded-lg p-3">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                className="border-purple-300"
              />
              <Label 
                htmlFor={`category-${category}`} 
                className="text-sm cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCategorySelector;
