-- Remote projects created before 0000 or with a partial schema may be missing these columns.
-- Run in Supabase: SQL Editor → New query → paste → Run, or: supabase db push

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS stitching_charge DECIMAL DEFAULT 450;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_bn TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN products.image_urls IS 'Array: full Supabase Storage URLs (admin) and/or local dummy filenames under /public/assets/punjabi';
