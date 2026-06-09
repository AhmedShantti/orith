/**
 * Pure-function tests for the checkout money math and Paymob HMAC.
 * Run with:  npm run test:checkout   (uses tsx; no test framework required)
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";

// Configure env BEFORE importing modules that read it (getters are lazy).
process.env.SHIPPING_FEE_CAIRO_GIZA = "5000";
process.env.SHIPPING_FEE_OTHER = "8000";
process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD = "150000";
process.env.PAYMOB_HMAC_SECRET = "test_secret";

import {
  egpToPiastres,
  piastresToEgp,
  calculateShippingFee,
  calculateCouponDiscount,
  computeOrderTotals,
} from "../lib/checkout/calculations";
import { verifyHmac } from "../lib/paymob/hmacCore";
import { PAYMOB_HMAC_FIELDS } from "../lib/paymob/constants";

const SECRET = "test_secret";
const verifyPaymobHMAC = (
  params: Record<string, string>,
  hmac: string | null
) => verifyHmac(params, hmac, SECRET);

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log("calculations");
test("egpToPiastres rounds correctly", () => {
  assert.equal(egpToPiastres(1175), 117500);
  assert.equal(egpToPiastres(12.5), 1250);
});
test("piastresToEgp inverts", () => {
  assert.equal(piastresToEgp(117500), 1175);
});
test("shipping: metro below threshold", () => {
  assert.equal(calculateShippingFee("Cairo", 100000), 5000);
  assert.equal(calculateShippingFee("Giza", 0), 5000);
});
test("shipping: non-metro below threshold", () => {
  assert.equal(calculateShippingFee("Aswan", 100000), 8000);
});
test("shipping: free at/over threshold", () => {
  assert.equal(calculateShippingFee("Cairo", 150000), 0);
  assert.equal(calculateShippingFee("Aswan", 200000), 0);
});
test("coupon: percentage", () => {
  assert.equal(
    calculateCouponDiscount(100000, { type: "PERCENTAGE", value: 10 }),
    10000
  );
});
test("coupon: percentage capped by maxDiscountAmount", () => {
  assert.equal(
    calculateCouponDiscount(100000, {
      type: "PERCENTAGE",
      value: 50,
      maxDiscountAmount: 5000,
    }),
    5000
  );
});
test("coupon: fixed amount never exceeds subtotal", () => {
  assert.equal(
    calculateCouponDiscount(8000, { type: "FIXED_AMOUNT", value: 20000 }),
    8000
  );
  assert.equal(
    calculateCouponDiscount(100000, { type: "FIXED_AMOUNT", value: 5000 }),
    5000
  );
});
test("coupon: floor on percentage", () => {
  // 333 * 10% = 33.3 -> floor 33
  assert.equal(
    calculateCouponDiscount(333, { type: "PERCENTAGE", value: 10 }),
    33
  );
});
test("computeOrderTotals composes net + shipping", () => {
  const t = computeOrderTotals({
    subtotal: 100000,
    discountAmount: 10000,
    governorate: "Cairo",
  });
  assert.deepEqual(t, {
    subtotal: 100000,
    discountAmount: 10000,
    shippingFee: 5000, // net 90000 < threshold
    taxAmount: 0,
    totalAmount: 95000,
  });
});
test("computeOrderTotals: discount pushes into free shipping", () => {
  const t = computeOrderTotals({
    subtotal: 160000,
    discountAmount: 0,
    governorate: "Aswan",
  });
  assert.equal(t.shippingFee, 0); // net 160000 >= 150000
  assert.equal(t.totalAmount, 160000);
});

console.log("hmac");
function buildParams(): Record<string, string> {
  const params: Record<string, string> = {};
  for (const f of PAYMOB_HMAC_FIELDS) params[f] = "0";
  params.id = "123456";
  params.amount_cents = "95000";
  params.success = "true";
  params.order = "987";
  params.currency = "EGP";
  return params;
}
function correctHmac(params: Record<string, string>): string {
  const concat = PAYMOB_HMAC_FIELDS.map((f) => params[f] ?? "").join("");
  return crypto.createHmac("sha512", "test_secret").update(concat).digest("hex");
}

test("verifyPaymobHMAC accepts a correct signature", () => {
  const params = buildParams();
  assert.equal(verifyPaymobHMAC(params, correctHmac(params)), true);
});
test("verifyPaymobHMAC rejects a wrong signature", () => {
  const params = buildParams();
  assert.equal(verifyPaymobHMAC(params, "deadbeef"), false);
});
test("verifyPaymobHMAC rejects after tampering with a field", () => {
  const params = buildParams();
  const hmac = correctHmac(params);
  params.amount_cents = "1"; // tamper
  assert.equal(verifyPaymobHMAC(params, hmac), false);
});
test("verifyPaymobHMAC rejects missing hmac", () => {
  const params = buildParams();
  assert.equal(verifyPaymobHMAC(params, null), false);
});

console.log(`\n${passed} checks passed.`);
