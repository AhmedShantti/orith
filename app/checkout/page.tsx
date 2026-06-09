"use client";

import dynamic from "next/dynamic";
import CheckoutSkeleton from "@/components/checkout/CheckoutSkeleton";

// Code-split the checkout bundle out of the main JS (Section 17.1). Client-only
// because it relies on sessionStorage / window APIs.
const CheckoutPage = dynamic(
  () => import("@/components/checkout/CheckoutPage"),
  {
    ssr: false,
    loading: () => (
      <div className="page-transition pt-28 pb-24 min-h-screen bg-ivory">
        <CheckoutSkeleton />
      </div>
    ),
  }
);

export default function Page() {
  return <CheckoutPage />;
}
