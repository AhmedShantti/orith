"use client";

import { apiUrl } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import OrderConfirmation from "@/components/order/OrderConfirmation";
import { Spinner } from "@/components/checkout/ui";
import type { Order } from "@/types";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = String(params.orderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("orith_token")
        : null;
    fetch(apiUrl(`/api/orders/${orderId}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setOrder(data.data as Order);
          setState("ready");
        } else {
          setState("error");
        }
      })
      .catch(() => setState("error"));
  }, [orderId]);

  if (state === "loading") {
    return (
      <div className="page-transition pt-16 pb-24 min-h-[70vh] flex items-center justify-center">
        <Spinner className="text-crimson w-8 h-8" />
      </div>
    );
  }

  if (state === "error" || !order) {
    return (
      <div className="page-transition pt-16 pb-24 min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="display text-3xl text-obsidian mb-4" style={{ fontWeight: 500 }}>
          Order Not Found
        </h1>
        <p className="accent-serif text-obsidian/60 text-lg mb-8 max-w-md">
          We couldn&apos;t find this order, or you don&apos;t have access to view
          it.
        </p>
        <Link href="/" className="btn-crimson">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="page-transition pt-16 pb-24 min-h-screen bg-ivory">
      <OrderConfirmation order={order} />
    </div>
  );
}
