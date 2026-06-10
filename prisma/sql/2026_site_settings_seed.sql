-- Site Settings — table + complete seed.
--
-- The "SiteSetting" table is normally created by Prisma (`cd backend && npm run
-- db:push`). This script also creates it (idempotently) so you can run the whole
-- thing in the Supabase SQL editor, then seeds every frontend setting key with
-- defaults that mirror the current hardcoded content.
--
-- Bilingual text fields use `_en` / `_ar` key suffixes. Lists are stored as JSON.
--
-- Apply:  psql "$DATABASE_URL" -f prisma/sql/2026_site_settings_seed.sql
--         (or paste into Supabase Dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS "SiteSetting" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "key"       TEXT UNIQUE NOT NULL,
  "value"     TEXT,
  "type"      TEXT NOT NULL DEFAULT 'text',
  "section"   TEXT,
  "label"     TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "SiteSetting_section_idx" ON "SiteSetting" ("section");

INSERT INTO "SiteSetting" ("id", "key", "value", "type", "section", "label") VALUES
  -- ── General ──
  (gen_random_uuid()::text, 'site_name_en', 'ORITH', 'text', 'general', 'Site Name (EN)'),
  (gen_random_uuid()::text, 'site_name_ar', 'أوريث', 'text', 'general', 'Site Name (AR)'),
  (gen_random_uuid()::text, 'site_logo', '', 'image', 'general', 'Site Logo'),
  (gen_random_uuid()::text, 'favicon', '', 'image', 'general', 'Favicon'),
  (gen_random_uuid()::text, 'primary_color', '#8E1B26', 'color', 'general', 'Primary Brand Color'),

  -- ── Navbar ──
  (gen_random_uuid()::text, 'navbar_logo', '', 'image', 'navbar', 'Navbar Logo'),
  (gen_random_uuid()::text, 'navbar_show_links', 'true', 'boolean', 'navbar', 'Show Nav Links'),
  (gen_random_uuid()::text, 'navbar_links',
    '[{"labelEn":"Home","labelAr":"الرئيسية","url":"/","visible":true},{"labelEn":"Products","labelAr":"المنتجات","url":"/products","visible":true},{"labelEn":"Offers","labelAr":"العروض","url":"/offers","visible":true},{"labelEn":"Contact","labelAr":"اتصل بنا","url":"/contact","visible":true}]',
    'json', 'navbar', 'Navigation Links'),

  -- ── Hero ──
  (gen_random_uuid()::text, 'hero_headline_en', E'Timeless by Design,\nDefined by Essence', 'text', 'hero', 'Headline (EN)'),
  (gen_random_uuid()::text, 'hero_headline_ar', E'خالدٌ بالتصميم،\nمُعرّفٌ بالجوهر', 'text', 'hero', 'Headline (AR)'),
  (gen_random_uuid()::text, 'hero_subheadline_en', 'At ORITH, fragrance is more than a scent — it is a statement of quiet elegance, crafted with precision and timeless sophistication.', 'text', 'hero', 'Subheadline (EN)'),
  (gen_random_uuid()::text, 'hero_subheadline_ar', 'في أوريث، العطر أكثر من مجرد رائحة — إنه تعبير عن الأناقة الهادئة، مصنوع بدقة وذوق رفيع خالد.', 'text', 'hero', 'Subheadline (AR)'),
  (gen_random_uuid()::text, 'hero_cta_label_en', 'Explore Collection', 'text', 'hero', 'CTA Label (EN)'),
  (gen_random_uuid()::text, 'hero_cta_label_ar', 'استكشف المجموعة', 'text', 'hero', 'CTA Label (AR)'),
  (gen_random_uuid()::text, 'hero_cta_url', '/products', 'url', 'hero', 'CTA URL'),
  (gen_random_uuid()::text, 'hero_background_image', '', 'image', 'hero', 'Background Image'),
  (gen_random_uuid()::text, 'hero_overlay_color', '#0C0B0A', 'color', 'hero', 'Overlay Color'),
  (gen_random_uuid()::text, 'hero_overlay_opacity', '0.5', 'text', 'hero', 'Overlay Opacity (0–1)'),

  -- ── Announcements Bar ──
  (gen_random_uuid()::text, 'announcement_enabled', 'false', 'boolean', 'announcements', 'Enable Bar'),
  (gen_random_uuid()::text, 'announcement_text_en', 'Free shipping on orders over 1500 EGP', 'text', 'announcements', 'Message (EN)'),
  (gen_random_uuid()::text, 'announcement_text_ar', 'شحن مجاني للطلبات فوق ١٥٠٠ ج.م', 'text', 'announcements', 'Message (AR)'),
  (gen_random_uuid()::text, 'announcement_bg_color', '#8E1B26', 'color', 'announcements', 'Background Color'),
  (gen_random_uuid()::text, 'announcement_text_color', '#F6F2EB', 'color', 'announcements', 'Text Color'),

  -- ── Footer ──
  (gen_random_uuid()::text, 'footer_logo', '', 'image', 'footer', 'Footer Logo'),
  (gen_random_uuid()::text, 'footer_copyright_en', '© ORITH. All rights reserved.', 'text', 'footer', 'Copyright (EN)'),
  (gen_random_uuid()::text, 'footer_copyright_ar', '© أوريث. جميع الحقوق محفوظة.', 'text', 'footer', 'Copyright (AR)'),
  (gen_random_uuid()::text, 'footer_social_facebook', '', 'url', 'footer', 'Facebook URL'),
  (gen_random_uuid()::text, 'footer_social_instagram', '', 'url', 'footer', 'Instagram URL'),
  (gen_random_uuid()::text, 'footer_social_tiktok', '', 'url', 'footer', 'TikTok URL'),
  (gen_random_uuid()::text, 'footer_social_whatsapp', '', 'url', 'footer', 'WhatsApp URL'),
  (gen_random_uuid()::text, 'footer_columns',
    '[{"titleEn":"Quick Links","titleAr":"روابط سريعة","links":[{"labelEn":"Products","labelAr":"المنتجات","url":"/products"},{"labelEn":"Offers","labelAr":"العروض","url":"/offers"},{"labelEn":"Contact","labelAr":"اتصل بنا","url":"/contact"}]}]',
    'json', 'footer', 'Footer Columns'),

  -- ── SEO ──
  (gen_random_uuid()::text, 'seo_meta_title_en', 'ORITH — Maison de Parfum', 'text', 'seo', 'Meta Title (EN)'),
  (gen_random_uuid()::text, 'seo_meta_title_ar', 'أوريث — بيت العطور', 'text', 'seo', 'Meta Title (AR)'),
  (gen_random_uuid()::text, 'seo_meta_description_en', 'ORITH — Maison de Parfum. Timeless by design, defined by essence. Extrait de Parfum, crafted with precision.', 'text', 'seo', 'Meta Description (EN)'),
  (gen_random_uuid()::text, 'seo_meta_description_ar', 'أوريث — بيت العطور. خالدٌ بالتصميم، مُعرّفٌ بالجوهر. عطور مصنوعة بدقة.', 'text', 'seo', 'Meta Description (AR)'),
  (gen_random_uuid()::text, 'seo_og_image', '', 'image', 'seo', 'Open Graph Image')
ON CONFLICT ("key") DO NOTHING;
