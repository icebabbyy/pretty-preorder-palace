
-- ตรวจสอบและปรับปรุง RLS policies สำหรับ product_images table
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการเข้าถึงรูปภาพ (อ่าน)
DROP POLICY IF EXISTS "Allow read access to product images" ON product_images;
CREATE POLICY "Allow read access to product images" ON product_images
  FOR SELECT USING (true);

-- สร้าง policy สำหรับการเพิ่มรูปภาพ
DROP POLICY IF EXISTS "Allow insert of product images" ON product_images;
CREATE POLICY "Allow insert of product images" ON product_images
  FOR INSERT WITH CHECK (true);

-- สร้าง policy สำหรับการอัปเดตรูปภาพ
DROP POLICY IF EXISTS "Allow update of product images" ON product_images;
CREATE POLICY "Allow update of product images" ON product_images
  FOR UPDATE USING (true);

-- สร้าง policy สำหรับการลบรูปภาพ
DROP POLICY IF EXISTS "Allow delete of product images" ON product_images;
CREATE POLICY "Allow delete of product images" ON product_images
  FOR DELETE USING (true);

-- ตรวจสอบและปรับปรุง RLS policies สำหรับ products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการเข้าถึงสินค้า
DROP POLICY IF EXISTS "Allow read access to products" ON products;
CREATE POLICY "Allow read access to products" ON products
  FOR SELECT USING (true);

-- สร้าง policy สำหรับการเพิ่มสินค้า
DROP POLICY IF EXISTS "Allow insert of products" ON products;
CREATE POLICY "Allow insert of products" ON products
  FOR INSERT WITH CHECK (true);

-- สร้าง policy สำหรับการอัปเดตสินค้า
DROP POLICY IF EXISTS "Allow update of products" ON products;
CREATE POLICY "Allow update of products" ON products
  FOR UPDATE USING (true);

-- สร้าง policy สำหรับการลบสินค้า
DROP POLICY IF EXISTS "Allow delete of products" ON products;
CREATE POLICY "Allow delete of products" ON products
  FOR DELETE USING (true);

-- ตรวจสอบและปรับปรุง RLS policies สำหรับ tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to tags" ON tags;
CREATE POLICY "Allow read access to tags" ON tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert of tags" ON tags;
CREATE POLICY "Allow insert of tags" ON tags
  FOR INSERT WITH CHECK (true);

-- ตรวจสอบและปรับปรุง RLS policies สำหรับ product_tags table
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to product_tags" ON product_tags;
CREATE POLICY "Allow read access to product_tags" ON product_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert of product_tags" ON product_tags;
CREATE POLICY "Allow insert of product_tags" ON product_tags
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete of product_tags" ON product_tags;
CREATE POLICY "Allow delete of product_tags" ON product_tags
  FOR DELETE USING (true);

-- สร้าง storage bucket สำหรับรูปภาพสินค้า (ถ้ายังไม่มี)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- สร้าง policy สำหรับ storage bucket
DROP POLICY IF EXISTS "Allow public access to product images" ON storage.objects;
CREATE POLICY "Allow public access to product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow upload to product images" ON storage.objects;
CREATE POLICY "Allow upload to product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow delete from product images" ON storage.objects;
CREATE POLICY "Allow delete from product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');
