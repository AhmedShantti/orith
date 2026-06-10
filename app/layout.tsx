import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { getSiteSettings } from "@/lib/siteSettings";

// Metadata is driven by the SEO site settings (English values for SSR), with
// hardcoded fallbacks so the page never ships empty tags.
export async function generateMetadata(): Promise<Metadata> {
  const { map } = await getSiteSettings();
  const title =
    map["seo_meta_title_en"] || "ORITH — Maison de Parfum";
  const description =
    map["seo_meta_description_en"] ||
    "ORITH — Maison de Parfum. Timeless by design, defined by essence. Extrait de Parfum, crafted with precision.";
  const ogImage = map["seo_og_image"] || undefined;
  return {
    title,
    description,
    keywords:
      "orith, maison de parfum, extrait de parfum, luxury perfume, oud, fragrance",
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { map } = await getSiteSettings();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cinzel:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600&family=Tajawal:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        {map["favicon"] ? (
          <link rel="icon" href={map["favicon"]} />
        ) : null}
      </head>
      <body className="bg-ivory min-h-screen">
        <LanguageProvider>
          <SiteSettingsProvider initial={map}>
            <CartProvider>{children}</CartProvider>
          </SiteSettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
