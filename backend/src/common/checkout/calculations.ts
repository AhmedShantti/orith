// Pure, unit-testable money math. ALL monetary values are integers in piastres
// (1 EGP = 100 piastres). No floating-point arithmetic for money; divisions use
// Math.floor.

import { commerceEnv } from "../env";
import { METRO_GOVERNORATES } from "./constants";
import type { CouponType } from "./types";

/** EGP (float) -> piastres (int). */
export function egpToPiastres(egp: number): number {
  return Math.round(egp * 100);
}

/** piastres (int) -> EGP (float, 2dp). */
export function piastresToEgp(piastres: number): number {
  return piastres / 100;
}

/** Format piastres as "1,250.00 EGP". */
export function formatPiastres(piastres: number, withCurrency = true): string {
  const egp = piastresToEgp(piastres);
  const formatted = new Intl.NumberFormat("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(egp);
  return withCurrency ? `${formatted} EGP` : formatted;
}

/**
 * Shipping fee for a governorate, in piastres. Free shipping kicks in once the
 * (post-discount) order value meets the configured threshold.
 *
 * @param governorate  destination governorate
 * @param netSubtotal  subtotal after discount, in piastres
 */
export function calculateShippingFee(
  governorate: string,
  netSubtotal: number
): number {
  if (netSubtotal >= commerceEnv.freeShippingThreshold) {
    return 0;
  }
  return METRO_GOVERNORATES.includes(governorate)
    ? commerceEnv.shippingFeeCairoGiza
    : commerceEnv.shippingFeeOther;
}

/**
 * Coupon discount, in piastres. Pure: takes only primitive coupon properties so
 * it can be reused identically by validate-coupon and create-order.
 */
export function calculateCouponDiscount(
  subtotal: number,
  coupon: {
    type: CouponType;
    value: number;
    maxDiscountAmount?: number | null;
  }
): number {
  if (subtotal <= 0) return 0;
  let discount: number;
  if (coupon.type === "PERCENTAGE") {
    discount = Math.floor((subtotal * coupon.value) / 100);
    if (coupon.maxDiscountAmount != null) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    // FIXED_AMOUNT — never exceed the subtotal.
    discount = Math.min(coupon.value, subtotal);
  }
  return Math.max(0, discount);
}

/** Human-readable coupon description, e.g. "10% OFF" / "50 EGP OFF". */
export function describeCoupon(coupon: {
  type: CouponType;
  value: number;
}): string {
  return coupon.type === "PERCENTAGE"
    ? `${coupon.value}% OFF`
    : `${piastresToEgp(coupon.value).toLocaleString("en-EG")} EGP OFF`;
}

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
}

/** Assemble the full order total from its parts (all piastres). */
export function computeOrderTotals(params: {
  subtotal: number;
  discountAmount: number;
  governorate: string;
  taxAmount?: number;
}): OrderTotals {
  const { subtotal, discountAmount } = params;
  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = calculateShippingFee(params.governorate, netSubtotal);
  const taxAmount = params.taxAmount ?? 0;
  const totalAmount = netSubtotal + shippingFee + taxAmount;
  return { subtotal, discountAmount, shippingFee, taxAmount, totalAmount };
}
