export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  image: string;
  sizes: string[];
  category: string;
  badge?: "bestseller" | "new" | "limited" | "offer";
  notes?: {
    top: string[];
    heart: string[];
    base: string[];
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

export interface Offer {
  id: string;
  product: Product;
  discountPercent: number;
  badgeType: "percent" | "limited" | "special";
  endsAt?: string;
}
