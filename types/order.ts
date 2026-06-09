// Order & order-item domain types for the professional checkout flow.
// All monetary values are integers in piastres (1 EGP = 100 piastres) unless a
// field name explicitly says EGP.

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

export type PaymentMethod = "MOBILE_WALLET" | "APPLE_PAY" | "CARD";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  quantity: number;
  price: number; // legacy unit price in EGP
  productName: string | null;
  productSku: string | null;
  variantName: string | null;
  unitPrice: number | null; // piastres
  totalPrice: number | null; // piastres
  imageUrl: string | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string | null;
  userId: string | null;
  status: OrderStatus;
  total: number; // legacy EGP total (admin display)

  customerFirstName: string | null;
  customerLastName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;

  shippingAddress1: string | null;
  shippingAddress2: string | null;
  shippingCity: string | null;
  shippingGovernorate: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;

  subtotal: number | null;
  discountAmount: number | null;
  shippingFee: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  currency: string | null;

  couponCode: string | null;
  couponId: string | null;

  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  paymobOrderId: string | null;
  paymobTransactionId: string | null;

  notes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  idempotencyKey: string | null;
  paidAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderBreakdown {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
}
