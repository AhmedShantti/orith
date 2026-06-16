-- Luxury product card — add optional `noteImages` column.
--
-- Stores a JSON map of fragrance-note name -> icon/image URL, e.g.
--   { "Rose": "/products/note-rose.png", "Oud": "/products/note-oud.png" }
--
-- Fully additive and backward compatible: the column is nullable with no
-- default, so every existing product row stays valid. The existing
-- "notesTop"/"notesHeart"/"notesBase" name arrays are untouched; the card
-- resolves a note's image by looking its name up in this map, and falls back
-- to a curated icon when there is no entry.
--
-- Apply with:  psql "$DATABASE_URL" -f prisma/sql/2026_product_note_images.sql
--              (or paste into Supabase Dashboard → SQL Editor)
--              or simply `cd backend && npm run db:push`

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "noteImages" JSONB;
