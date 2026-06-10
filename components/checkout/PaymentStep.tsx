"use client";

import React, { useEffect, useState } from "react";
import { Wallet, Banknote } from "lucide-react";
import StepShell from "./StepShell";
import PaymentMethodCard from "./PaymentMethodCard";
import { TextField } from "./ui";
import { useCheckout } from "@/hooks/useCheckout";
import { walletPhoneSchema } from "@/lib/checkout/validation";

// Inline Apple Pay mark (no external fetch).
function ApplePayIcon() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" fill="none" aria-hidden="true">
      <path
        d="M7.3 7.1c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.3-.7 2.1.8.1 1.6-.4 2.1-1zm.7 1.1c-1.2-.1-2.2.7-2.7.7-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1 0 1.4.6 2.3.6s1.5-.9 2.1-1.7c.7-1 .9-1.9.9-2-.1 0-1.8-.7-1.8-2.7 0-1.7 1.4-2.5 1.4-2.5-.7-1.1-2-1.1-2.4-1.1z"
        fill="currentColor"
      />
      <text x="14" y="16" fontFamily="Helvetica, Arial, sans-serif" fontSize="11" fontWeight="600" fill="currentColor">
        Pay
      </text>
    </svg>
  );
}

export default function PaymentStep() {
  const { state, store, next, back } = useCheckout();
  const { payment } = state;
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [walletTouched, setWalletTouched] = useState(false);

  useEffect(() => {
    try {
      const w = window as unknown as {
        ApplePaySession?: { canMakePayments?: () => boolean };
      };
      if (w.ApplePaySession && typeof w.ApplePaySession.canMakePayments === "function") {
        setApplePayAvailable(w.ApplePaySession.canMakePayments());
      }
    } catch {
      setApplePayAvailable(false);
    }
  }, []);

  const walletError =
    payment.method === "MOBILE_WALLET" && walletTouched
      ? walletPhoneSchema.safeParse(payment.walletPhone).success
        ? undefined
        : "Please enter a valid Egyptian phone number"
      : undefined;

  const canContinue =
    payment.method === "APPLE_PAY" ||
    payment.method === "COD" ||
    (payment.method === "MOBILE_WALLET" &&
      walletPhoneSchema.safeParse(payment.walletPhone).success);

  function handleContinue() {
    if (payment.method === "MOBILE_WALLET") {
      setWalletTouched(true);
      if (!walletPhoneSchema.safeParse(payment.walletPhone).success) {
        document.getElementById("wallet-phone")?.focus();
        return;
      }
    }
    if (!payment.method) return;
    next();
  }

  return (
    <StepShell
      eyebrow="Step 4 of 5"
      title="Payment Method"
      onBack={back}
      continueLabel="Continue to Review"
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      <div role="radiogroup" aria-label="Payment method" className="flex flex-col gap-4">
        <PaymentMethodCard
          id="mobile-wallet"
          label="Mobile Wallet"
          sublabel="Vodafone Cash, Orange Money, Etisalat Cash, We Pay"
          icon={<Wallet size={26} />}
          isSelected={payment.method === "MOBILE_WALLET"}
          isAvailable
          onSelect={() => store.setPaymentMethod("MOBILE_WALLET")}
        />

        {/* Wallet phone — smooth reveal, no layout jump */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: payment.method === "MOBILE_WALLET" ? 140 : 0,
            opacity: payment.method === "MOBILE_WALLET" ? 1 : 0,
          }}
        >
          <div className="pt-1 pb-1 ps-1">
            <TextField
              id="wallet-phone"
              label="Wallet Phone Number"
              type="tel"
              required
              placeholder="+20 1XX XXX XXXX"
              value={payment.walletPhone}
              onChange={(e) => store.setWalletPhone(e.target.value)}
              onBlur={() => setWalletTouched(true)}
              error={walletError}
            />
          </div>
        </div>

        <PaymentMethodCard
          id="apple-pay"
          label="Apple Pay"
          sublabel="Available on Safari and Apple devices"
          icon={<ApplePayIcon />}
          isSelected={payment.method === "APPLE_PAY"}
          isAvailable={applePayAvailable}
          onSelect={() => store.setPaymentMethod("APPLE_PAY")}
          ariaLabel="Pay with Apple Pay"
        />

        <PaymentMethodCard
          id="cod"
          label="Cash on Delivery"
          sublabel="Pay in cash when your order arrives"
          icon={<Banknote size={26} />}
          isSelected={payment.method === "COD"}
          isAvailable
          onSelect={() => store.setPaymentMethod("COD")}
          ariaLabel="Pay with Cash on Delivery"
        />

        {/* COD confirmation note — smooth reveal, no layout jump */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: payment.method === "COD" ? 80 : 0,
            opacity: payment.method === "COD" ? 1 : 0,
          }}
        >
          <p className="text-sm font-body text-obsidian/70 bg-ivory border border-obsidian/12 px-4 py-3">
            You will pay in cash when your order arrives.
          </p>
        </div>
      </div>
    </StepShell>
  );
}
