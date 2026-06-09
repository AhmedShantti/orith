// Coupon domain types.

export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // percentage (0-100) OR fixed amount in piastres
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number | null;
  isActive: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date;
}

// Result of a successful coupon validation, surfaced to the client.
export interface AppliedCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  discountAmount: number; // piastres
  description: string; // e.g. "10% OFF" / "50 EGP OFF"
}

export type CouponErrorCode =
  | "COUPON_NOT_FOUND"
  | "COUPON_EXPIRED"
  | "COUPON_USAGE_LIMIT"
  | "COUPON_MIN_ORDER"
  | "COUPON_INACTIVE";
