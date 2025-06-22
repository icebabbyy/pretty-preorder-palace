-- แทนที่จะให้ทุกคน access เต็ม ควรให้เฉพาะ admin
-- โดยใช้ auth.uid() ร่วมกับ profiles.role
DROP POLICY IF EXISTS "Enable insert for all" ON products;
DROP POLICY IF EXISTS "Enable update for all" ON products;
DROP POLICY IF EXISTS "Enable delete for all" ON products;

-- ✅ นี่คือเวอร์ชันที่ปลอดภัยกว่า
CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
