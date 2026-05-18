import { Product, Offer } from "@/types";

// Image paths are matched to the printed names on each bottle photo.
// Most matches are clear from the label; a few (marked with TODO in comments) are best-guesses
// based on the bottle's color/style and the product description — verify in the UI and swap if wrong.

export const products: Product[] = [
  {
    id: "1",
    nameEn: "Rehal Forest",
    nameAr: "رحال فورست",
    descriptionEn:
      "A green woody fragrance with a luxurious yet refreshing character — for those who love deep, calm scents, suited to daily wear and evening occasions.",
    descriptionAr:
      "عطر خشبي أخضر بطابع فخم ومنعش، مناسب لمحبي الروائح العميقة الهادئة للاستخدام اليومي والمساء.",
    price: 1175,
    image: "/products/bottle-6.png",
    sizes: ["100ml"],
    category: "woody",
  },
  {
    id: "2",
    nameEn: "Rehal Desert",
    nameAr: "رحال ديزرت",
    descriptionEn:
      "A warm oriental fragrance with a desert character — amber and wood, unisex, perfect for special occasions.",
    descriptionAr:
      "عطر شرقي دافئ بطابع صحراوي، فيه إحساس عنبري/خشبي مناسب للرجال والنساء والمناسبات.",
    price: 1539,
    image: "/products/bottle-8.png",
    sizes: ["100ml"],
    category: "oriental",
  },
  {
    id: "3",
    nameEn: "Qamarain Rose",
    nameAr: "قمرين روز",
    descriptionEn:
      "A soft, feminine rose fragrance for lovers of roses and gentle floral scents.",
    descriptionAr:
      "عطر وردي أنثوي ناعم، مناسب لمحبي الورد والروائح الزهرية الهادئة.",
    price: 775,
    image: "/products/bottle-1.png",
    sizes: ["100ml"],
    category: "floral",
    badge: "bestseller",
  },
  {
    id: "4",
    nameEn: "Qamarain Velvet",
    // TODO verify: assigned the ornate purple/violet bottle on color match
    nameAr: "قمرين فيلفت",
    descriptionEn:
      "A velvety feminine fragrance with a soft, warm floral character — ideal for evenings and going out.",
    descriptionAr:
      "عطر مخملي أنثوي بطابع زهري ناعم ودافئ، مناسب للمساء والخروجات.",
    price: 1520,
    image: "/products/bottle-4.png",
    sizes: ["100ml"],
    category: "floral",
  },
  {
    id: "5",
    nameEn: "Hybah",
    nameAr: "هيبة",
    descriptionEn:
      "A strong, luxurious men's fragrance with an oriental woody character — for occasions and the workday.",
    descriptionAr:
      "عطر رجالي قوي وفخم بطابع شرقي خشبي، مناسب للمناسبات والدوام.",
    price: 1240,
    image: "/products/bottle-3.png",
    sizes: ["100ml"],
    category: "oriental",
  },
  {
    id: "6",
    nameEn: "Ameer Al Oud",
    nameAr: "أمير العود",
    descriptionEn:
      "A pronounced and luxurious oriental oud — for true oud lovers and rich, heavy compositions.",
    descriptionAr:
      "عطر عود شرقي واضح وفخم، مناسب لمحبي العود والروائح الثقيلة.",
    price: 685,
    // gold bottle with stylized "أمير" Arabic calligraphy
    image: "/products/bottle-12.png",
    sizes: ["100ml"],
    category: "oriental",
    badge: "bestseller",
  },
  {
    id: "7",
    nameEn: "Musk Al Ruman",
    // TODO verify: assigned the peach/coral bottle on color match
    nameAr: "مسك الرمان",
    descriptionEn:
      "A musky, fruity fragrance with a pomegranate accord — soft, sweet, and perfect for everyday wear.",
    descriptionAr:
      "عطر مسكي فاكهي بنفحة رمان، ناعم وحلو ومناسب للاستخدام اليومي.",
    price: 979,
    image: "/products/bottle-5.png",
    sizes: ["100ml"],
    category: "fresh",
  },
  {
    id: "8",
    nameEn: "Asturi Wood",
    nameAr: "أستوري وود",
    descriptionEn:
      "An elegant, calm woody scent for those who love warm, soft fragrances.",
    descriptionAr:
      "عطر خشبي أنيق وهادئ، مناسب لمحبي الروائح الدافئة غير الحادة.",
    price: 1465,
    image: "/products/bottle-15.png",
    sizes: ["100ml"],
    category: "woody",
  },
  {
    id: "9",
    nameEn: "Asturi Extreme",
    nameAr: "أستوري إكستريم",
    descriptionEn:
      "A stronger, denser woody-aromatic edition — built for the evening and long-lasting projection.",
    descriptionAr:
      "نسخة أقوى وأكثر كثافة بطابع خشبي/عطري، مناسبة للمساء والثبات العالي.",
    price: 1540,
    image: "/products/bottle-7.png",
    sizes: ["100ml"],
    category: "woody",
  },
  {
    id: "10",
    nameEn: "Prime 25N",
    nameAr: "برايم 25N",
    descriptionEn:
      "A unisex fragrance with a modern, luxurious character — daily wear and outings.",
    descriptionAr:
      "عطر يونيسكس بطابع عصري فاخر، مناسب للاستخدام اليومي والخروجات.",
    price: 1799,
    image: "/products/bottle-13.png",
    sizes: ["100ml"],
    category: "fresh",
  },
  {
    id: "11",
    nameEn: "Prime 26N",
    nameAr: "برايم 26N",
    descriptionEn:
      "A modern unisex fragrance with relatively heavy character — for evenings and occasions.",
    descriptionAr:
      "عطر يونيسكس عصري وثقيل نسبيًا، مناسب للمساء والمناسبات.",
    price: 1850,
    image: "/products/bottle-14.png",
    sizes: ["100ml"],
    category: "oriental",
  },
  {
    id: "12",
    nameEn: "The Story Sport",
    nameAr: "ذا ستوري سبورت",
    descriptionEn:
      "A fresh, clean sport men's fragrance — for daytime, summer, and the office.",
    descriptionAr:
      "عطر رجالي سبورت منعش ونظيف، مناسب للنهار والصيف والدوام.",
    price: 1710,
    image: "/products/bottle-16.png",
    sizes: ["100ml"],
    category: "fresh",
  },
  {
    id: "13",
    nameEn: "Caramel Latte",
    nameAr: "كراميل لاتيه",
    descriptionEn:
      "A sweet gourmand fragrance with caramel and coffee/latte notes — for lovers of warm, sugary scents.",
    descriptionAr:
      "عطر جورماند حلو برائحة كراميل وقهوة/لاتيه، مناسب لمحبي الروائح السكرية الدافئة.",
    price: 1180,
    image: "/products/bottle-19.png",
    sizes: ["100ml"],
    category: "powdery",
    badge: "new",
  },
  {
    id: "14",
    nameEn: "Deema Sweet",
    // TODO verify: assigned the pink "S-logo" bottle on color match
    nameAr: "ديما سويت",
    descriptionEn:
      "A sweet, creamy women's fragrance with notes of black currant, ginger, orange blossom, jasmine, rum musk, cedarwood, musk, and vanilla.",
    descriptionAr:
      "عطر نسائي حلو وكريمي؛ من نوتاته كشمش أسود، زنجبيل، زهر البرتقال، ياسمين، لاكتونيك، مسك الروم، خشب الأرز، مسك وفانيليا.",
    price: 1240,
    image: "/products/bottle-22.png",
    sizes: ["100ml"],
    category: "floral",
    notes: {
      top: ["Black Currant", "Ginger"],
      heart: ["Orange Blossom", "Jasmine"],
      base: ["Cedarwood", "Musk", "Vanilla"],
    },
  },
  {
    id: "15",
    nameEn: "Hamilton",
    nameAr: "هاميلتون",
    descriptionEn:
      "A classic, elegant men's fragrance — for the workday and daily wear.",
    descriptionAr:
      "عطر رجالي كلاسيكي أنيق، مناسب للدوام والاستخدام اليومي.",
    price: 524,
    image: "/products/bottle-17.png",
    sizes: ["100ml"],
    category: "woody",
  },
  {
    id: "16",
    nameEn: "Azure Scent",
    nameAr: "أزور سينت",
    descriptionEn:
      "A fresh, clean unisex fragrance with an aquatic blue character — for summer and daytime.",
    descriptionAr:
      "عطر يونيسكس منعش ونظيف بطابع أزرق مائي، مناسب للصيف والنهار.",
    price: 500,
    image: "/products/bottle-18.png",
    sizes: ["100ml"],
    category: "fresh",
  },
  {
    id: "17",
    nameEn: "Cleo",
    // TODO verify: NO bottle in the folder is labeled "Cleo". This points at bottle-2.png
    // (a red bottle labeled "YOM") as a fallback. Replace this image if you have a Cleo photo.
    nameAr: "كليو",
    descriptionEn:
      "A soft, feminine women's fragrance — for daily wear and light outings.",
    descriptionAr:
      "عطر نسائي ناعم وأنثوي، مناسب للاستخدام اليومي والخروجات الخفيفة.",
    price: 489,
    image: "/products/bottle-2.png",
    sizes: ["100ml"],
    category: "floral",
  },
  {
    id: "18",
    nameEn: "Elixir De Homme",
    nameAr: "إكسير دي أوم",
    descriptionEn:
      "A strong, elegant men's fragrance — for the evening and occasions.",
    descriptionAr:
      "عطر رجالي بطابع قوي وأنيق، مناسب للمساء والمناسبات.",
    price: 489,
    image: "/products/bottle-20.png",
    sizes: ["100ml"],
    category: "woody",
  },
  {
    id: "19",
    nameEn: "Al Oud Al Azraq",
    nameAr: "العود الأزرق",
    descriptionEn:
      "A blue oud with a luxurious oriental character and a modern touch — unisex.",
    descriptionAr:
      "عطر عود أزرق بطابع شرقي فاخر مع لمسة عصرية، مناسب للرجال والنساء.",
    price: 1029,
    image: "/products/bottle-21.png",
    sizes: ["100ml"],
    category: "oriental",
  },
  {
    id: "20",
    nameEn: "Anna Wardi",
    nameAr: "آنا وردي",
    descriptionEn:
      "A soft, romantic women's rose fragrance — for those who love roses and clean scents.",
    descriptionAr:
      "عطر وردي نسائي ناعم ورومانسي، مناسب لمحبي الورود والروائح النظيفة.",
    price: 1425,
    image: "/products/bottle-11.png",
    sizes: ["100ml"],
    category: "floral",
  },
  {
    id: "21",
    nameEn: "Soul Bruno",
    nameAr: "سول برونو",
    descriptionEn:
      "A warm, modern men's fragrance with a sweet woody character — for outings and the evening.",
    descriptionAr:
      "عطر رجالي دافئ وعصري بطابع خشبي/حلو، مناسب للخروجات والمساء.",
    price: 850,
    image: "/products/bottle-23.png",
    sizes: ["100ml"],
    category: "woody",
  },
  {
    id: "22",
    nameEn: "Hayman Malaki",
    nameAr: "هيمان ملكي",
    descriptionEn:
      "A royal, luxurious oriental fragrance with strong character — for occasions and rich, heavy compositions.",
    descriptionAr:
      "عطر شرقي ملكي وفخم بطابع قوي، مناسب للمناسبات والروائح الثقيلة.",
    price: 1540,
    image: "/products/bottle-10.png",
    sizes: ["100ml"],
    category: "oriental",
    badge: "limited",
  },
  {
    id: "23",
    nameEn: "Sapphire Paradise",
    nameAr: "سافاير باراديس",
    descriptionEn:
      "A luxurious unisex fragrance with a fresh, fruity character and a soft touch — perfect for going out.",
    descriptionAr:
      "عطر يونيسكس فاخر بطابع منعش/فاكهي مع لمسة ناعمة، مناسب للخروجات.",
    price: 1575,
    image: "/products/bottle-26.png",
    sizes: ["100ml"],
    category: "fresh",
  },
  {
    id: "24",
    nameEn: "White Heart",
    nameAr: "وايت هارت",
    descriptionEn:
      "A soft, clean fragrance with musky-floral character — for daily wear.",
    descriptionAr:
      "عطر ناعم ونظيف بطابع مسكي/زهري، مناسب للاستخدام اليومي.",
    price: 825,
    image: "/products/bottle-9.png",
    sizes: ["100ml"],
    category: "floral",
  },
  {
    id: "25",
    nameEn: "Hilarious",
    nameAr: "هيلاريوس",
    descriptionEn:
      "A large 200ml bottle with a youthful, fresh character — perfect for daily wear.",
    descriptionAr:
      "عطر بحجم كبير 200 مل بطابع شبابي منعش، مناسب للاستخدام اليومي.",
    price: 1112,
    image: "/products/bottle-24.png",
    sizes: ["200ml"],
    category: "fresh",
  },
  {
    id: "26",
    nameEn: "Mulham Nawar",
    nameAr: "ملهم نوار",
    descriptionEn:
      "A warm oriental-floral fragrance — unisex, ideal for the evening.",
    descriptionAr:
      "عطر شرقي زهري/دافئ، مناسب للرجال والنساء وللمساء.",
    price: 1378,
    image: "/products/bottle-25.png",
    sizes: ["100ml"],
    category: "oriental",
  },
  {
    id: "27",
    nameEn: "Sweet Oud",
    nameAr: "سويت عود",
    descriptionEn:
      "A sweet, warm oud fragrance — for lovers of soft, mellow oud.",
    descriptionAr:
      "عطر عود حلو ودافئ، مناسب لمحبي العود الناعم غير الحاد.",
    price: 845,
    image: "/products/bottle-28.png",
    sizes: ["100ml"],
    category: "oriental",
  },
  {
    id: "28",
    nameEn: "L'Amour Rouge",
    nameAr: "لامور روج",
    descriptionEn:
      "A warm, sensual fragrance with a red floral-sweet character — feminine/unisex, made for the evening.",
    descriptionAr:
      "عطر أنثوي/يونيسكس دافئ وحسي بطابع أحمر زهري/حلو، مناسب للمساء.",
    price: 1540,
    image: "/products/bottle-27.png",
    sizes: ["100ml"],
    category: "floral",
  },
  {
    id: "29",
    nameEn: "Farsah",
    nameAr: "فرسة",
    descriptionEn:
      "A luxurious oriental fragrance with a soft, warm character — for occasions and outings.",
    descriptionAr:
      "عطر شرقي فاخر بطابع ناعم ودافئ، مناسب للمناسبات والخروجات.",
    price: 1496,
    image: "/products/bottle-30.png",
    sizes: ["100ml"],
    category: "oriental",
  },
  // Slot 30 — the bottle is labeled "WAJAHAH" but isn't in your product list yet.
  // Send name/price/description if you want it sold.
  {
    id: "30",
    nameEn: "Wajahah",
    nameAr: "وجاهة",
    descriptionEn: "Details coming soon. A new addition to the Orith signature collection.",
    descriptionAr: "التفاصيل قريبا. إضافة جديدة إلى مجموعة أوريث المميزة.",
    price: 1500,
    image: "/products/bottle-29.png",
    sizes: ["100ml"],
    category: "oriental",
  },
  // Slot 31 — bottle labeled "TEXAS TOBACCO", not in your product list yet.
  {
    id: "31",
    nameEn: "Texas Tobacco",
    nameAr: "تكساس توباكو",
    descriptionEn: "Details coming soon. A new addition to the Orith signature collection.",
    descriptionAr: "التفاصيل قريبا. إضافة جديدة إلى مجموعة أوريث المميزة.",
    price: 1500,
    image: "/products/bottle-31.png",
    sizes: ["100ml"],
    category: "woody",
  },
];

// Highlighted savings — derived from the real products list.
// Edit the indices below or the discount percent to feature different products.
export const offers: Offer[] = [
  {
    id: "o1",
    product: {
      ...products[5], // Ameer Al Oud — best-value oud
      originalPrice: 925,
      price: products[5].price,
    },
    discountPercent: 26,
    badgeType: "percent",
  },
  {
    id: "o2",
    product: {
      ...products[2], // Qamarain Rose
      originalPrice: 1520,
      price: products[2].price,
    },
    discountPercent: 49,
    badgeType: "limited",
  },
  {
    id: "o3",
    product: {
      ...products[14], // Hamilton
      originalPrice: 595,
      price: products[14].price,
    },
    discountPercent: 12,
    badgeType: "special",
  },
  {
    id: "o4",
    product: {
      ...products[12], // Caramel Latte
      originalPrice: 1430,
      price: products[12].price,
    },
    discountPercent: 17,
    badgeType: "percent",
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
