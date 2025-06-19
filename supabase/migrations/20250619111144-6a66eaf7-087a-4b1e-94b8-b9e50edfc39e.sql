
-- เพิ่ม column product_type ในตาราง products
ALTER TABLE public.products 
ADD COLUMN product_type TEXT;

-- สร้างตาราง product_types สำหรับจัดการประเภทสินค้า
CREATE TABLE public.product_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เพิ่มข้อมูลประเภทสินค้าเริ่มต้น
INSERT INTO public.product_types (name) VALUES 
  ('Keyring/Keychain'),
  ('Mini Figure/Figure'),
  ('Big Figure/Statue'),
  ('Medium Figure/Statue'),
  ('Plush'),
  ('Standee');
