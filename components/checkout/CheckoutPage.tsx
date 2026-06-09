"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CheckoutProvider } from "@/store/checkoutStore";
import { useCheckout } from "@/hooks/useCheckout";
import StepIndicator from "./StepIndicator";
import OrderSummaryCard from "./OrderSummaryCard";
import CheckoutSkeleton from "./CheckoutSkeleton";
import CustomerInfoStep from "./CustomerInfoStep";
import ShippingStep from "./ShippingStep";
import OrderSummaryStep from "./OrderSummaryStep";
import PaymentStep from "./PaymentStep";
import OrderReviewStep from "./OrderReviewStep";
import type { CartItem } from "@/types";

function cartSignatureOf(items: CartItem[]): string {
  return items
    .map((i) => `${i.product.id}:${i.selectedSize}:${i.quantity}`)
    .sort()
    .join("|");
}

function CheckoutInner() {
  const { state, store, totals, cartItems } = useCheckout();

  const StepComponent = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return <CustomerInfoStep />;
      case 2:
        return <ShippingStep />;
      case 3:
        return <OrderSummaryStep />;
      case 4:
        return <PaymentStep />;
      case 5:
        return <OrderReviewStep />;
      default:
        return <CustomerInfoStep />;
    }
  }, [state.currentStep]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 lg:mb-12">
        <StepIndicator
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
          onStepClick={(s) => store.setCurrentStep(s)}
        />
      </div>

      {/* Mobile: collapsible summary at the top */}
      <div className="lg:hidden mb-8">
        <OrderSummaryCard
          items={cartItems}
          totals={totals}
          appliedCoupon={state.coupon.appliedCoupon}
          onRemoveCoupon={store.removeCoupon}
          collapsible
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
        <div className="max-w-[580px] w-full">
          <div key={state.currentStep} className="checkout-step">
            {StepComponent}
          </div>
        </div>

        {/* Desktop: sticky summary sidebar */}
        <div className="hidden lg:block">
          <OrderSummaryCard
            items={cartItems}
            totals={totals}
            appliedCoupon={state.coupon.appliedCoupon}
            onRemoveCoupon={store.removeCoupon}
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items } = useCart();
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);

  // Brief init window: lets the cart hydrate from localStorage and shows the
  // skeleton for up to ~400ms before deciding on empty-cart redirect.
  useEffect(() => {
    const timer = setTimeout(() => setInitializing(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Checkout — ${
      process.env.NEXT_PUBLIC_STORE_NAME || "ORITH"
    }`;
  }, []);

  useEffect(() => {
    if (!initializing && items.length === 0) {
      router.replace("/cart");
    }
  }, [initializing, items.length, router]);

  if (initializing || items.length === 0) {
    return (
      <div className="page-transition pt-28 pb-24 min-h-screen bg-ivory">
        <CheckoutSkeleton />
      </div>
    );
  }

  return (
    <div className="page-transition pt-28 pb-28 min-h-screen bg-ivory">
      <CheckoutProvider cartSignature={cartSignatureOf(items)}>
        <CheckoutInner />
      </CheckoutProvider>
    </div>
  );
}
