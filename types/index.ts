// Frontend types (legacy)
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

// Backend API types
export type UserRole = "ADMIN" | "CUSTOMER";
export type OrderStatus =
  | "PENDING"
  | "PENDING_PAYMENT"
  | "AWAITING_CONFIRMATION"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "PAYMENT_FAILED";
export type PaymentStatus =
  | "UNPAID"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";
export type PaymentMethod = "MOBILE_WALLET" | "APPLE_PAY" | "CARD" | "COD";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackendProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  originalPrice: number | null;
  image: string;
  sizes: string[];
  category: string;
  badge: string | null;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string | null;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  user?: User | null;

  // Professional-checkout fields (all optional for backward compatibility)
  orderNumber?: string | null;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress1?: string | null;
  shippingAddress2?: string | null;
  shippingCity?: string | null;
  shippingGovernorate?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  shippingFee?: number | null;
  taxAmount?: number | null;
  totalAmount?: number | null;
  currency?: string | null;
  couponCode?: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentStatus?: PaymentStatus | null;
  paidAt?: Date | null;
  notes?: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  quantity: number;
  price: number;
  createdAt: Date;
  product?: BackendProduct | null;

  productName?: string | null;
  productSku?: string | null;
  variantName?: string | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  imageUrl?: string | null;
}

export interface BackendCartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product?: BackendProduct;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
