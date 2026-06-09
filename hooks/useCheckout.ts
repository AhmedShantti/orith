"use client";

// Checkout state-machine hook: derives live totals from the cart + checkout
// state, validates each step, and drives order creation. Field mutations go
// through useCheckoutStore directly; this hook owns navigation + submission.

import { apiUrl } from "@/lib/api";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useCheckoutStore } from "@/store/checkoutStore";
import {
  egpToPiastres,
  calculateShippingFee,
} from "@/lib/checkout/calculations";
import {
  customerSchema,
  shippingSchema,
  walletPhoneSchema,
} from "@/lib/checkout/validation";
import type { CheckoutLineItemInput, CreatedOrder } from "@/types/checkout";
import { useCallback as useCb } from "react";

export interface CheckoutTotals {
  subtotal: number; // piastres
  discountAmount: number; // piastres
  shippingFee: number | null; // piastres, null = not yet known
  totalAmount: number; // piastres
}

export function useCheckout() {
  const cart = useCart();
  const store = useCheckoutStore();
  const { state } = store;

  // ---- Live totals (all piastres) ----
  const totals: CheckoutTotals = useMemo(() => {
    const subtotal = cart.items.reduce(
      (sum, i) => sum + egpToPiastres(i.product.price) * i.quantity,
      0
    );
    const discountAmount = state.coupon.appliedCoupon?.discountAmount ?? 0;
    const netSubtotal = Math.max(0, subtotal - discountAmount);

    let shippingFee: number | null = state.shipping.calculatedShippingFee;
    if (state.shipping.governorate) {
      shippingFee = calculateShippingFee(state.shipping.governorate, netSubtotal);
    }
    const totalAmount = netSubtotal + (shippingFee ?? 0);
    return { subtotal, discountAmount, shippingFee, totalAmount };
  }, [
    cart.items,
    state.coupon.appliedCoupon,
    state.shipping.governorate,
    state.shipping.calculatedShippingFee,
  ]);

  const lineItems: CheckoutLineItemInput[] = useMemo(
    () =>
      cart.items.map((i) => ({
        productId: i.product.id,
        variantName: i.selectedSize,
        quantity: i.quantity,
      })),
    [cart.items]
  );

  // ---- Per-step validation ----
  const validateStep = useCb(
    (step: number): boolean => {
      switch (step) {
        case 1:
          return customerSchema.safeParse(state.customer).success;
        case 2:
          return shippingSchema.safeParse({
            address1: state.shipping.address1,
            address2: state.shipping.address2,
            city: state.shipping.city,
            governorate: state.shipping.governorate,
            postalCode: state.shipping.postalCode,
            notes: state.shipping.notes,
          }).success;
        case 3:
          return true; // coupon optional
        case 4:
          if (!state.payment.method) return false;
          if (state.payment.method === "MOBILE_WALLET") {
            return walletPhoneSchema.safeParse(state.payment.walletPhone).success;
          }
          return true;
        default:
          return true;
      }
    },
    [state.customer, state.shipping, state.payment]
  );

  // ---- Navigation ----
  const goToStep = useCb(
    (step: number) => store.setCurrentStep(step),
    [store]
  );

  const next = useCb(() => {
    const current = state.currentStep;
    if (!validateStep(current)) return false;
    store.completeStep(current);
    const target = Math.min(5, current + 1);
    store.setCurrentStep(target);
    if (target === 5) store.ensureIdempotencyKey();
    return true;
  }, [state.currentStep, validateStep, store]);

  const back = useCb(() => {
    store.setCurrentStep(Math.max(1, state.currentStep - 1));
  }, [state.currentStep, store]);

  // ---- Order creation ----
  const createOrder = useCb(async (): Promise<CreatedOrder | null> => {
    store.setOrderCreating(true);
    try {
      const res = await fetch(apiUrl("/api/checkout/create-order"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: state.order.idempotencyKey,
          customer: state.customer,
          shipping: {
            address1: state.shipping.address1,
            address2: state.shipping.address2 || undefined,
            city: state.shipping.city,
            governorate: state.shipping.governorate,
            postalCode: state.shipping.postalCode || undefined,
            notes: state.shipping.notes || undefined,
          },
          items: lineItems,
          couponCode: state.coupon.appliedCoupon?.code || undefined,
          paymentMethod: state.payment.method,
          walletPhone: state.payment.walletPhone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 422) {
          store.setOrderError(
            "Some items in your cart are no longer available. Please return to your cart."
          );
        } else if (data?.message) {
          store.setOrderError(data.message);
        } else {
          store.setOrderError("We couldn't create your order. Please try again.");
        }
        return null;
      }
      store.setOrderCreated(data.order as CreatedOrder);
      return data.order as CreatedOrder;
    } catch {
      store.setOrderError(
        "Connection error. Please check your internet and try again."
      );
      return null;
    }
  }, [state, lineItems, store]);

  return {
    state,
    store,
    totals,
    lineItems,
    cartItems: cart.items,
    validateStep,
    goToStep,
    next,
    back,
    createOrder,
  };
}
