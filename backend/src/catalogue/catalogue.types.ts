// Storefront catalogue types (mirrors the frontend `Product`/`Offer` shapes).
// The catalogue is static data, served by the products module.

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
  brand?: string;
  rating?: number;
  notes?: {
    top: string[];
    heart: string[];
    base: string[];
  };
}

export interface Offer {
  id: string;
  product: Product;
  discountPercent: number;
  badgeType: "percent" | "limited" | "special";
  endsAt?: string;
}

export interface Category {
  id: string;
  labelEn: string;
  labelAr: string;
}
