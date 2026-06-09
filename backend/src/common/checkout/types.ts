// Checkout / coupon / order domain types for the backend.

export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface AppliedCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  discountAmount: number; // piastres
  description: string;
}

export type CouponErrorCode =
  | "COUPON_NOT_FOUND"
  | "COUPON_EXPIRED"
  | "COUPON_USAGE_LIMIT"
  | "COUPON_MIN_ORDER"
  | "COUPON_INACTIVE";

export interface PaymentVerifyResult {
  status: "PAID" | "FAILED" | "PENDING" | "NOT_FOUND";
  orderNumber?: string;
  orderId?: string;
  totalAmount?: number;
  currency?: string;
}
