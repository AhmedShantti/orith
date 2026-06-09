"use client";

import React, { useEffect, useRef, useState } from "react";
import StepShell from "./StepShell";
import { TextField } from "./ui";
import { useCheckout } from "@/hooks/useCheckout";
import { customerSchema } from "@/lib/checkout/validation";

type FieldErrors = Partial<Record<keyof typeof initialTouched, string>>;
const initialTouched = {
  firstName: false,
  lastName: false,
  email: false,
  phone: false,
};

export default function CustomerInfoStep() {
  const { state, store, next } = useCheckout();
  const { customer } = state;
  const [touched, setTouched] = useState(initialTouched);
  const [errors, setErrors] = useState<FieldErrors>({});
  const prefilled = useRef(false);

  // Pre-populate from the authenticated profile (best effort) if empty.
  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    if (customer.email || customer.firstName) return;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("orith_token")
        : null;
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const user = data?.data ?? data?.user ?? data;
        if (!user?.email) return;
        const [first, ...rest] = String(user.name ?? "").split(" ");
        store.updateCustomer({
          firstName: customer.firstName || first || "",
          lastName: customer.lastName || rest.join(" ") || "",
          email: customer.email || user.email,
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function computeErrors(): FieldErrors {
    const result = customerSchema.safeParse(customer);
    if (result.success) return {};
    const out: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !out[key]) out[key] = issue.message;
    }
    return out;
  }

  function handleBlur(field: keyof typeof initialTouched) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(computeErrors());
  }

  function handleContinue() {
    const all = computeErrors();
    setErrors(all);
    if (Object.keys(all).length > 0) {
      setTouched({ firstName: true, lastName: true, email: true, phone: true });
      const firstKey = Object.keys(all)[0];
      document.getElementById(`customer-${firstKey}`)?.focus();
      return;
    }
    next();
  }

  const show = (f: keyof typeof initialTouched) =>
    touched[f] ? errors[f] : undefined;

  const isValid = customerSchema.safeParse(customer).success;

  return (
    <StepShell
      eyebrow="Step 1 of 5"
      title="Customer Information"
      showBack={false}
      continueLabel="Continue to Shipping"
      onContinue={handleContinue}
      continueDisabled={!isValid}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField
          id="customer-firstName"
          label="First Name"
          required
          maxLength={50}
          autoComplete="given-name"
          value={customer.firstName}
          onChange={(e) => store.updateCustomer({ firstName: e.target.value })}
          onBlur={() => handleBlur("firstName")}
          error={show("firstName")}
        />
        <TextField
          id="customer-lastName"
          label="Last Name"
          required
          maxLength={50}
          autoComplete="family-name"
          value={customer.lastName}
          onChange={(e) => store.updateCustomer({ lastName: e.target.value })}
          onBlur={() => handleBlur("lastName")}
          error={show("lastName")}
        />
        <TextField
          id="customer-email"
          label="Email Address"
          type="email"
          required
          maxLength={100}
          autoComplete="email"
          className="sm:col-span-2"
          value={customer.email}
          onChange={(e) => store.updateCustomer({ email: e.target.value })}
          onBlur={() => handleBlur("email")}
          error={show("email")}
        />
        <TextField
          id="customer-phone"
          label="Phone Number"
          type="tel"
          required
          autoComplete="tel"
          className="sm:col-span-2"
          hint="Egyptian mobile number, e.g. +20 100 123 4567"
          placeholder="+20 1XX XXX XXXX"
          value={customer.phone}
          onChange={(e) => store.updateCustomer({ phone: e.target.value })}
          onBlur={() => handleBlur("phone")}
          error={show("phone")}
        />
      </div>
    </StepShell>
  );
}
