// Server-side coupon validation, shared by the validate-coupon endpoint and
// create-order. Takes a Prisma client so it stays decoupled from DI.

import type { PrismaClient } from "@prisma/client";
import { calculateCouponDiscount, describeCoupon } from "./calculations";
import type { AppliedCoupon, CouponErrorCode } from "./types";

export type CouponValidationResult =
  | { ok: true; coupon: AppliedCoupon; couponId: string }
  | { ok: false; error: CouponErrorCode; requiredAmount?: number };

type DbClient = Pick<PrismaClient, "coupon">;

export async function validateCoupon(
  prisma: DbClient,
  code: string,
  subtotal: number,
  now: Date = new Date()
): Promise<CouponValidationResult> {
  const normalized = code.trim().toUpperCase();

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalized },
  });

  if (!coupon) return { ok: false, error: "COUPON_NOT_FOUND" };
  if (!coupon.isActive) return { ok: false, error: "COUPON_INACTIVE" };

  if (coupon.validFrom && coupon.validFrom > now) {
    return { ok: false, error: "COUPON_EXPIRED" };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { ok: false, error: "COUPON_EXPIRED" };
  }
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, error: "COUPON_USAGE_LIMIT" };
  }
  if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
    return {
      ok: false,
      error: "COUPON_MIN_ORDER",
      requiredAmount: coupon.minOrderAmount,
    };
  }

  const discountAmount = calculateCouponDiscount(subtotal, {
    type: coupon.type,
    value: coupon.value,
    maxDiscountAmount: coupon.maxDiscountAmount,
  });

  return {
    ok: true,
    couponId: coupon.id,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      description: describeCoupon({ type: coupon.type, value: coupon.value }),
    },
  };
}

export const COUPON_ERROR_MESSAGES: Record<CouponErrorCode, string> = {
  COUPON_NOT_FOUND: "This coupon code is not valid.",
  COUPON_EXPIRED: "This coupon has expired.",
  COUPON_USAGE_LIMIT: "This coupon has reached its usage limit.",
  COUPON_MIN_ORDER: "This coupon requires a minimum order amount.",
  COUPON_INACTIVE: "This coupon is currently inactive.",
};
