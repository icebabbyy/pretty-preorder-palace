
-- เปิดใช้งาน Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ทุกคนสามารถดูสินค้าได้
CREATE POLICY "Enable read access for all" ON products
FOR SELECT
USING (true);

-- ทุกคนสามารถเพิ่มสินค้าได้
CREATE POLICY "Enable insert for all" ON products
FOR INSERT
WITH CHECK (true);

-- ทุกคนสามารถอัปเดตสินค้าได้
CREATE POLICY "Enable update for all" ON products
FOR UPDATE
USING (true);

-- ทุกคนสามารถลบสินค้าได้
CREATE POLICY "Enable delete for all" ON products
FOR DELETE
USING (true);
