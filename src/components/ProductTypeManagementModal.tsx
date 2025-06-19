
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import { addProductType, deleteProductType } from "@/utils/productTypes";

interface ProductTypeManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTypes: string[];
  setProductTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProductTypeManagementModal = ({ 
  open, 
  onOpenChange, 
  productTypes, 
  setProductTypes 
}: ProductTypeManagementModalProps) => {
  const [newProductType, setNewProductType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddProductType = async () => {
    if (!newProductType.trim()) return;
    
    if (productTypes.includes(newProductType.trim())) {
      alert("ประเภทสินค้านี้มีอยู่แล้ว");
      return;
    }

    setLoading(true);
    try {
      await addProductType(newProductType.trim());
      setProductTypes(prev => [...prev, newProductType.trim()].sort());
      setNewProductType("");
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเพิ่มประเภทสินค้า");
    }
    setLoading(false);
  };

  const handleDeleteProductType = async (productType: string) => {
    if (!confirm(`คุณต้องการลบประเภทสินค้า "${productType}" หรือไม่?`)) return;

    setLoading(true);
    try {
      await deleteProductType(productType);
      setProductTypes(prev => prev.filter(type => type !== productType));
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบประเภทสินค้า");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-purple-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-800">
            จัดการประเภทสินค้า
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newProductType">เพิ่มประเภทสินค้าใหม่</Label>
              <Input
                id="newProductType"
                value={newProductType}
                onChange={(e) => setNewProductType(e.target.value)}
                placeholder="ชื่อประเภทสินค้า"
                className="border border-purple-200 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleAddProductType()}
              />
            </div>
            <Button
              onClick={handleAddProductType}
              disabled={!newProductType.trim() || loading}
              className="mt-6 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <Label>ประเภทสินค้าทั้งหมด</Label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-purple-200 rounded-lg p-3">
              {productTypes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ยังไม่มีประเภทสินค้า</p>
              ) : (
                productTypes.map((productType) => (
                  <div
                    key={productType}
                    className="flex items-center justify-between p-2 bg-purple-50 rounded-lg"
                  >
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {productType}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProductType(productType)}
                      disabled={loading}
                      className="text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-purple-200">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductTypeManagementModal;
