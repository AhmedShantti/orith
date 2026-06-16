-- Luxury product card — add optional `brand` and `rating` columns.
--
-- Fully additive and backward compatible: both columns are nullable with no
-- default, so every existing product row stays valid and untouched. The
-- storefront falls back to the store name when `brand` is null and hides the
-- rating row when `rating` is null.
--
-- This is the only schema change required by the redesigned product card.
-- Notes already exist as the "notesTop"/"notesHeart"/"notesBase" array columns.
--
-- Apply with:  psql "$DATABASE_URL" -f prisma/sql/2026_product_brand_rating.sql
--              (or paste into Supabase Dashboard → SQL Editor)
--              or simply `cd backend && npm run db:push`

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brand" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION;
