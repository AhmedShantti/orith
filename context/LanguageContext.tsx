"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "en" | "ar";

interface Translations {
  nav: {
    home: string;
    products: string;
    offers: string;
    cart: string;
    contact: string;
  };
  hero: {
    tagline: string;
    headline: string;
    sub: string;
    cta: string;
    ctaOffers: string;
  };
  products: {
    title: string;
    subtitle: string;
    addToCart: string;
    viewDetails: string;
    search: string;
    filterAll: string;
    noResults: string;
    size: string;
    selectSize: string;
  };
  offers: {
    title: string;
    subtitle: string;
    off: string;
    limitedTime: string;
    specialOffer: string;
    oldPrice: string;
  };
  badges: {
    bestseller: string;
    new: string;
    limited: string;
    offer: string;
  };
  cart: {
    title: string;
    empty: string;
    emptyDesc: string;
    shopNow: string;
    subtotal: string;
    total: string;
    remove: string;
    qty: string;
    orderWhatsApp: string;
    orderMessage: string;
  };
  contact: {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    address: string;
    addressValue: string;
    followUs: string;
    hours: string;
    hoursValue: string;
  };
  footer: {
    rights: string;
    tagline: string;
    quickLinks: string;
    followUs: string;
    newsletter: string;
    newsletterPlaceholder: string;
    subscribe: string;
  };
  details: {
    topNotes: string;
    heartNotes: string;
    baseNotes: string;
    fragrance: string;
    back: string;
    inEgp: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      products: "Products",
      offers: "Offers",
      cart: "Cart",
      contact: "Contact",
    },
    hero: {
      tagline: "Maison de Parfum",
      headline: "Timeless by Design,\nDefined by Essence",
      sub: "At ORITH, fragrance is more than a scent — it is a statement of quiet elegance, crafted with precision and timeless sophistication.",
      cta: "Explore Collection",
      ctaOffers: "View Offers",
    },
    products: {
      title: "Our Collection",
      subtitle: "Handcrafted fragrances for the discerning soul",
      addToCart: "Add to Cart",
      viewDetails: "View Details",
      search: "Search fragrances...",
      filterAll: "All",
      noResults: "No fragrances found.",
      size: "Size",
      selectSize: "Select Size",
    },
    offers: {
      title: "Exclusive Offers",
      subtitle: "Exceptional fragrances at extraordinary prices",
      off: "OFF",
      limitedTime: "Limited Time",
      specialOffer: "Special Offer",
      oldPrice: "Was",
    },
    badges: {
      bestseller: "Best Seller",
      new: "New Arrival",
      limited: "Limited Edition",
      offer: "Special Offer",
    },
    cart: {
      title: "Your Cart",
      empty: "Your cart is empty",
      emptyDesc: "Discover our luxury fragrances and add your favorites.",
      shopNow: "Shop Now",
      subtotal: "Subtotal",
      total: "Total",
      remove: "Remove",
      qty: "Qty",
      orderWhatsApp: "Order via WhatsApp",
      orderMessage: "Hello! I'd like to order the following:\n",
    },
    contact: {
      title: "Get In Touch",
      subtitle: "We'd love to hear from you",
      phone: "Phone",
      email: "Email",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      facebook: "Facebook",
      tiktok: "TikTok",
      address: "Address",
      addressValue: "Cairo, Egypt",
      followUs: "Follow Us",
      hours: "Working Hours",
      hoursValue: "Sat – Thu: 10am – 10pm",
    },
    footer: {
      rights: "All rights reserved.",
      tagline: "Timeless by design, defined by essence",
      quickLinks: "Quick Links",
      followUs: "Follow Us",
      newsletter: "Newsletter",
      newsletterPlaceholder: "Your email address",
      subscribe: "Subscribe",
    },
    details: {
      topNotes: "Top Notes",
      heartNotes: "Heart Notes",
      baseNotes: "Base Notes",
      fragrance: "Fragrance Notes",
      back: "Back",
      inEgp: "EGP",
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      products: "المنتجات",
      offers: "العروض",
      cart: "السلة",
      contact: "اتصل بنا",
    },
    hero: {
      tagline: "بيت العطور",
      headline: "خالدٌ بالتصميم،\nمُعرّفٌ بالجوهر",
      sub: "في أوريث، العطر أكثر من مجرد رائحة — إنه تعبير عن الأناقة الهادئة، مصنوع بدقة وذوق رفيع خالد.",
      cta: "استكشف المجموعة",
      ctaOffers: "عرض العروض",
    },
    products: {
      title: "مجموعتنا",
      subtitle: "عطور مصنوعة يدويًا للروح المتذوقة",
      addToCart: "أضف إلى السلة",
      viewDetails: "عرض التفاصيل",
      search: "ابحث عن عطر...",
      filterAll: "الكل",
      noResults: "لم يتم العثور على عطور.",
      size: "الحجم",
      selectSize: "اختر الحجم",
    },
    offers: {
      title: "عروض حصرية",
      subtitle: "عطور استثنائية بأسعار مميزة",
      off: "خصم",
      limitedTime: "وقت محدود",
      specialOffer: "عرض خاص",
      oldPrice: "كان",
    },
    badges: {
      bestseller: "الأكثر مبيعاً",
      new: "وصل حديثاً",
      limited: "إصدار محدود",
      offer: "عرض خاص",
    },
    cart: {
      title: "سلة التسوق",
      empty: "سلتك فارغة",
      emptyDesc: "اكتشف عطورنا الفاخرة وأضف مفضلاتك.",
      shopNow: "تسوق الآن",
      subtotal: "المجموع الفرعي",
      total: "الإجمالي",
      remove: "إزالة",
      qty: "الكمية",
      orderWhatsApp: "اطلب عبر واتساب",
      orderMessage: "مرحباً! أريد طلب التالي:\n",
    },
    contact: {
      title: "تواصل معنا",
      subtitle: "يسعدنا سماع رأيك",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      whatsapp: "واتساب",
      instagram: "إنستغرام",
      facebook: "فيسبوك",
      tiktok: "تيك توك",
      address: "العنوان",
      addressValue: "القاهرة، مصر",
      followUs: "تابعنا",
      hours: "ساعات العمل",
      hoursValue: "السبت – الخميس: ١٠ص – ١٠م",
    },
    footer: {
      rights: "جميع الحقوق محفوظة.",
      tagline: "خالدٌ بالتصميم، مُعرّفٌ بالجوهر",
      quickLinks: "روابط سريعة",
      followUs: "تابعنا",
      newsletter: "النشرة البريدية",
      newsletterPlaceholder: "بريدك الإلكتروني",
      subscribe: "اشترك",
    },
    details: {
      topNotes: "نوتات القمة",
      heartNotes: "نوتات القلب",
      baseNotes: "نوتات القاعدة",
      fragrance: "نوتات العطر",
      back: "رجوع",
      inEgp: "جنيه",
    },
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("orith-lang") as Language | null;
    if (stored) setLangState(stored);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("orith-lang", l);
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t: translations[lang], dir: lang === "ar" ? "rtl" : "ltr" }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
