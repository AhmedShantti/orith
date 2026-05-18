import { Product, Offer } from "@/types";

export const products: Product[] = [
  {
    id: "1",
    nameEn: "Layali",
    nameAr: "ليالي",
    descriptionEn:
      "A deep, smoky oud enveloped in warm amber and sandalwood. An ode to the ancient Arabia, reborn in modern luxury.",
    descriptionAr:
      "عود عميق ودخاني محاط بالعنبر الدافئ وخشب الصندل. قصيدة في الجزيرة العربية القديمة، تولد من جديد في فخامة عصرية.",
    price: 1850,
    image: "/products/bottle-amber.svg",
    sizes: ["50ml", "100ml"],
    category: "oriental",
    badge: "bestseller",
    notes: {
      top: ["Saffron", "Rose"],
      heart: ["Oud", "Amber"],
      base: ["Sandalwood", "Musk"],
    },
  },
  {
    id: "2",
    nameEn: "Warda",
    nameAr: "وردة",
    descriptionEn:
      "A delicate dance of Bulgarian rose and peony, kissed by white musk and soft cedar. Femininity in its purest form.",
    descriptionAr:
      "رقصة رقيقة من الورد البلغاري وزهرة الفاوانيا، تلمسها المسك الأبيض وأرز ناعم. الأنوثة في أنقى صورها.",
    price: 1450,
    image: "/products/bottle-rose.svg",
    sizes: ["30ml", "50ml", "100ml"],
    category: "floral",
    badge: "new",
    notes: {
      top: ["Peony", "Bergamot"],
      heart: ["Bulgarian Rose", "Jasmine"],
      base: ["White Musk", "Cedar"],
    },
  },
  {
    id: "3",
    nameEn: "Mihrab",
    nameAr: "محراب",
    descriptionEn:
      "Bold black pepper meets velvety tonka bean and dark vanilla. A statement of confident elegance.",
    descriptionAr:
      "الفلفل الأسود الجريء يلتقي بحبة التونكا المخملية والفانيليا الداكنة. تصريح بالأناقة الواثقة.",
    price: 2100,
    image: "/products/bottle-noir.svg",
    sizes: ["50ml", "100ml"],
    category: "woody",
    badge: "limited",
    notes: {
      top: ["Black Pepper", "Cardamom"],
      heart: ["Leather", "Iris"],
      base: ["Tonka Bean", "Dark Vanilla"],
    },
  },
  {
    id: "4",
    nameEn: "Sharq",
    nameAr: "شرق",
    descriptionEn:
      "Powdery iris and violet petals rest on a golden base of warm amber and creamy vanilla. Timeless and sophisticated.",
    descriptionAr:
      "بودرة السوسن وبتلات البنفسج تستقر على قاعدة ذهبية من العنبر الدافئ والفانيليا الكريمية. خالد ورفيع.",
    price: 1650,
    image: "/products/bottle-gold.svg",
    sizes: ["50ml", "100ml"],
    category: "powdery",
    notes: {
      top: ["Violet", "Aldehydes"],
      heart: ["Iris", "Ylang-Ylang"],
      base: ["Amber", "Vanilla", "Musk"],
    },
  },
  {
    id: "5",
    nameEn: "Ghuroob",
    nameAr: "غروب",
    descriptionEn:
      "Warm desert sands captured in myrrh, labdanum, and a whisper of incense. The essence of golden sunsets.",
    descriptionAr:
      "رمال الصحراء الدافئة محاصرة في المر واللدنم وهمسة من البخور. جوهر غروب الشمس الذهبي.",
    price: 1950,
    image: "/products/bottle-amber.svg",
    sizes: ["50ml", "100ml"],
    category: "oriental",
    badge: "bestseller",
    notes: {
      top: ["Incense", "Bergamot"],
      heart: ["Myrrh", "Labdanum"],
      base: ["Amber", "Sandalwood"],
    },
  },
  {
    id: "6",
    nameEn: "Nasma",
    nameAr: "نسمة",
    descriptionEn:
      "Sparkling Italian bergamot and Sicilian lemon, softened by white tea and sheer musks. Effortless freshness.",
    descriptionAr:
      "البرغموت الإيطالي المتألق وليمون صقلية، ملطف بالشاي الأبيض والمسك الشفاف. انتعاش بلا جهد.",
    price: 1250,
    image: "/products/bottle-rose.svg",
    sizes: ["30ml", "50ml", "100ml"],
    category: "fresh",
    badge: "new",
    notes: {
      top: ["Bergamot", "Sicilian Lemon"],
      heart: ["White Tea", "Neroli"],
      base: ["White Musk", "Ambergris"],
    },
  },
  {
    id: "7",
    nameEn: "Tarab",
    nameAr: "طرب",
    descriptionEn:
      "Rich amber resins blended with sweet benzoin and warm patchouli. A royal fragrance for unforgettable evenings.",
    descriptionAr:
      "راتنجات العنبر الغنية ممزوجة بالبنزوين الحلو والباتشولي الدافئ. عطر ملكي لأمسيات لا تُنسى.",
    price: 2350,
    image: "/products/bottle-noir.svg",
    sizes: ["100ml"],
    category: "oriental",
    badge: "limited",
    notes: {
      top: ["Cinnamon", "Cardamom"],
      heart: ["Amber", "Benzoin"],
      base: ["Patchouli", "Vanilla", "Musk"],
    },
  },
  {
    id: "8",
    nameEn: "Yasmeen",
    nameAr: "ياسمين",
    descriptionEn:
      "The purest jasmine absolute wrapped in solar white flowers and translucent skin musks. Pure, luminous joy.",
    descriptionAr:
      "أنقى عبق الياسمين ملفوف بزهور بيضاء شمسية ومسك الجلد الشفاف. فرح نقي متألق.",
    price: 1550,
    image: "/products/bottle-gold.svg",
    sizes: ["30ml", "50ml", "100ml"],
    category: "floral",
    notes: {
      top: ["Bergamot", "Green Leaves"],
      heart: ["Jasmine Absolute", "Tuberose"],
      base: ["Skin Musk", "White Amber"],
    },
  },
];

export const offers: Offer[] = [
  {
    id: "o1",
    product: {
      ...products[0],
      originalPrice: products[0].price,
      price: Math.round(products[0].price * 0.8),
    },
    discountPercent: 20,
    badgeType: "percent",
  },
  {
    id: "o2",
    product: {
      ...products[2],
      originalPrice: products[2].price,
      price: Math.round(products[2].price * 0.75),
    },
    discountPercent: 25,
    badgeType: "limited",
    endsAt: "2025-12-31",
  },
  {
    id: "o3",
    product: {
      ...products[4],
      originalPrice: products[4].price,
      price: Math.round(products[4].price * 0.85),
    },
    discountPercent: 15,
    badgeType: "special",
  },
  {
    id: "o4",
    product: {
      ...products[6],
      originalPrice: products[6].price,
      price: Math.round(products[6].price * 0.7),
    },
    discountPercent: 30,
    badgeType: "limited",
  },
];

export const categories = [
  { id: "all", labelEn: "All", labelAr: "الكل" },
  { id: "oriental", labelEn: "Oriental", labelAr: "شرقي" },
  { id: "floral", labelEn: "Floral", labelAr: "زهري" },
  { id: "woody", labelEn: "Woody", labelAr: "خشبي" },
  { id: "fresh", labelEn: "Fresh", labelAr: "منعش" },
  { id: "powdery", labelEn: "Powdery", labelAr: "بودري" },
];
