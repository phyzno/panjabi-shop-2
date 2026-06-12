-- Migration: Update fabrics table to match current Drizzle schema
-- Changes: Convert id from serial to text, add missing columns

-- Step 1: Add missing columns with defaults
ALTER TABLE "fabrics" ADD COLUMN IF NOT EXISTS "discount_percentage" integer DEFAULT 0;
ALTER TABLE "fabrics" ADD COLUMN IF NOT EXISTS "preview_images" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "fabrics" ADD COLUMN IF NOT EXISTS "video_url" text;
ALTER TABLE "fabrics" ADD COLUMN IF NOT EXISTS "group_id" text;
ALTER TABLE "fabrics" ADD COLUMN IF NOT EXISTS "color_name" text;
ALTER TABLE "fabrics" ADD COLUMN IF NOT EXISTS "color_hex" text;
ALTER TABLE "fabrics" ADD COLUMN IF NOT EXISTS "allowed_products" jsonb DEFAULT '[]'::jsonb;

-- Step 2: Convert id column from serial to text
-- Create temporary text column
ALTER TABLE "fabrics" ADD COLUMN IF NOT EXISTS "id_new" text;

-- Populate the temporary text column with string-converted id values
UPDATE "fabrics" SET "id_new" = 'FAB-' || LPAD(CAST("id" AS text), 3, '0') WHERE "id_new" IS NULL;

-- Drop the old primary key constraint
ALTER TABLE "fabrics" DROP CONSTRAINT "fabrics_pkey";

-- Drop the old id column
ALTER TABLE "fabrics" DROP COLUMN "id";

-- Rename the new text column to id
ALTER TABLE "fabrics" RENAME COLUMN "id_new" TO "id";

-- Set the new id as primary key
ALTER TABLE "fabrics" ADD PRIMARY KEY ("id");
