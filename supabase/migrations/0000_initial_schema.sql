-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT UNIQUE,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Measurements
CREATE TABLE measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'My Measurements',
  chest DECIMAL, shoulder DECIMAL,
  sleeve_length DECIMAL, body_length DECIMAL,
  neck DECIMAL, waist DECIMAL,
  hip DECIMAL, thigh DECIMAL, ankle DECIMAL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fabrics
CREATE TABLE fabrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  fabric_type TEXT NOT NULL,
  description TEXT,
  price_per_yard DECIMAL NOT NULL,
  color_hex TEXT,
  image_url TEXT,
  youtube_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Design Options
CREATE TABLE design_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  name_bn TEXT,
  image_url TEXT,
  price_addition DECIMAL DEFAULT 0,
  for_product TEXT DEFAULT 'both',
  sort_order INT DEFAULT 0
);

-- Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT,
  name TEXT NOT NULL,
  name_bn TEXT,
  description TEXT,
  base_price DECIMAL NOT NULL,
  stitching_charge DECIMAL DEFAULT 450,
  image_urls TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  guest_name TEXT, guest_phone TEXT,
  guest_address TEXT, guest_city TEXT,
  status TEXT DEFAULT 'pending',
  subtotal DECIMAL NOT NULL,
  stitching_charge DECIMAL DEFAULT 0,
  delivery_charge DECIMAL DEFAULT 60,
  total DECIMAL NOT NULL,
  advance_required DECIMAL DEFAULT 0,
  advance_paid DECIMAL DEFAULT 0,
  remaining_amount DECIMAL,
  payment_method TEXT,
  delivery_address TEXT, delivery_city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  fabric_id UUID REFERENCES fabrics(id),
  fabric_name TEXT,
  color_hex TEXT,
  color_name TEXT,
  collar_style TEXT, sleeve_style TEXT,
  button_style TEXT, pocket_style TEXT,
  length_style TEXT,
  size_type TEXT, standard_size TEXT,
  measurement_snapshot JSONB,
  special_instructions TEXT,
  preview_image_url TEXT,
  quantity INT DEFAULT 1,
  unit_price DECIMAL NOT NULL,
  total_price DECIMAL NOT NULL
);

-- Payment Transactions
CREATE TABLE payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  amount DECIMAL NOT NULL,
  method TEXT NOT NULL,
  transaction_id TEXT,
  type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON profiles FOR ALL USING (auth.uid() = id);

ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own measurements" ON measurements FOR ALL USING (auth.uid() = user_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders" ON orders FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "public fabrics" ON fabrics FOR SELECT USING (true);
CREATE POLICY "public products" ON products FOR SELECT USING (true);
CREATE POLICY "public design_options" ON design_options FOR SELECT USING (true);

-- ORDER NUMBER TRIGGER
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'PS-' || 
    TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- SEED DATA
INSERT INTO fabrics (name, name_bn, fabric_type, price_per_yard, description) VALUES
('Premium Cotton', 'প্রিমিয়াম কটন', 'plain', 180, 'Soft breathable cotton'),
('Linen Blend', 'লিনেন ব্লেন্ড', 'linen', 220, 'Cool and lightweight'),
('Silk Blend', 'সিল্ক মিশ্রণ', 'silk', 350, 'Lustrous premium fabric'),
('Cotton Check', 'চেক কটন', 'check', 200, 'Classic check pattern'),
('Striped Cotton', 'স্ট্রাইপ কটন', 'stripe', 190, 'Elegant vertical stripes'),
('Embroidered Muslin', 'এমব্রয়ডারি মসলিন', 'embroidery', 420, 'Traditional embroidered');

INSERT INTO products (type, category, name, name_bn, base_price, stitching_charge, image_urls) VALUES
('panjabi', 'casual', 'Classic Casual Panjabi', 'ক্লাসিক পাঞ্জাবি', 800, 450, ARRAY['1-2.webp','1-1.webp']),
('panjabi', 'premium', 'Premium Navy Panjabi', 'প্রিমিয়াম নেভি পাঞ্জাবি', 1200, 450, ARRAY['1-1.webp','Blue-1-1.webp']),
('panjabi', 'wedding', 'Wedding Embroidered', 'ওয়েডিং পাঞ্জাবি', 2500, 550, ARRAY['Merun-KC-2.webp','1-34.webp']),
('panjabi', 'casual', 'Off White Summer', 'অফ হোয়াইট পাঞ্জাবি', 900, 450, ARRAY['Off-White-1.webp']);
