"use client";

import React, { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import StepShell from "./StepShell";
import { TextField, SelectField, TextAreaField } from "./ui";
import { useCheckout } from "@/hooks/useCheckout";
import { shippingSchema } from "@/lib/checkout/validation";
import { EGYPTIAN_GOVERNORATES } from "@/lib/checkout/constants";
import { formatPiastres } from "@/lib/checkout/calculations";

type Field = "address1" | "address2" | "city" | "governorate" | "postalCode" | "notes";

export default function ShippingStep() {
  const { state, store, totals, next, back } = useCheckout();
  const { shipping } = state;
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    address1: false,
    address2: false,
    city: false,
    governorate: false,
    postalCode: false,
    notes: false,
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const payload = {
    address1: shipping.address1,
    address2: shipping.address2,
    city: shipping.city,
    governorate: shipping.governorate,
    postalCode: shipping.postalCode,
    notes: shipping.notes,
  };

  // Persist the calculated fee for display fallback when navigating between steps.
  useEffect(() => {
    if (shipping.governorate && totals.shippingFee !== null) {
      store.setShippingFee(totals.shippingFee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipping.governorate, totals.shippingFee]);

  function computeErrors(): Partial<Record<Field, string>> {
    const result = shippingSchema.safeParse(payload);
    if (result.success) return {};
    const out: Partial<Record<Field, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as Field;
      if (key && !out[key]) out[key] = issue.message;
    }
    return out;
  }

  function blur(field: Field) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(computeErrors());
  }

  function handleContinue() {
    const all = computeErrors();
    setErrors(all);
    if (Object.keys(all).length > 0) {
      setTouched((t) => ({ ...t, address1: true, city: true, governorate: true }));
      const firstKey = Object.keys(all)[0];
      document.getElementById(`shipping-${firstKey}`)?.focus();
      return;
    }
    next();
  }

  const show = (f: Field) => (touched[f] ? errors[f] : undefined);
  const isValid = shippingSchema.safeParse(payload).success;

  return (
    <StepShell
      eyebrow="Step 2 of 5"
      title="Shipping Details"
      onBack={back}
      continueLabel="Continue to Order Summary"
      onContinue={handleContinue}
      continueDisabled={!isValid}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField
          id="shipping-address1"
          label="Address Line 1"
          required
          maxLength={200}
          autoComplete="address-line1"
          className="sm:col-span-2"
          value={shipping.address1}
          onChange={(e) => store.updateShipping({ address1: e.target.value })}
          onBlur={() => blur("address1")}
          error={show("address1")}
        />
        <TextField
          id="shipping-address2"
          label="Address Line 2"
          maxLength={200}
          autoComplete="address-line2"
          placeholder="Apartment, floor, building"
          className="sm:col-span-2"
          value={shipping.address2}
          onChange={(e) => store.updateShipping({ address2: e.target.value })}
          onBlur={() => blur("address2")}
          error={show("address2")}
        />
        <TextField
          id="shipping-city"
          label="City"
          required
          maxLength={100}
          autoComplete="address-level2"
          value={shipping.city}
          onChange={(e) => store.updateShipping({ city: e.target.value })}
          onBlur={() => blur("city")}
          error={show("city")}
        />
        <SelectField
          id="shipping-governorate"
          label="Governorate"
          required
          placeholder="Select governorate"
          options={EGYPTIAN_GOVERNORATES}
          value={shipping.governorate}
          onChange={(e) => store.updateShipping({ governorate: e.target.value })}
          onBlur={() => blur("governorate")}
          error={show("governorate")}
        />

        {/* Shipping-fee info box */}
        {shipping.governorate && totals.shippingFee !== null && (
          <div className="sm:col-span-2 flex items-center gap-3 bg-ivory border border-obsidian/12 px-4 py-3">
            <Truck size={16} className="text-crimson shrink-0" />
            <p className="text-xs font-body text-obsidian/70">
              Shipping to <strong className="font-medium">{shipping.governorate}</strong>:{" "}
              {totals.shippingFee === 0 ? (
                <span className="text-emerald-700 font-medium">
                  FREE (order qualifies)
                </span>
              ) : (
                <span className="font-medium">
                  {formatPiastres(totals.shippingFee)}
                </span>
              )}
            </p>
          </div>
        )}

        <TextField
          id="shipping-postalCode"
          label="Postal Code"
          inputMode="numeric"
          maxLength={5}
          autoComplete="postal-code"
          value={shipping.postalCode}
          onChange={(e) =>
            store.updateShipping({
              postalCode: e.target.value.replace(/\D/g, "").slice(0, 5),
            })
          }
          onBlur={() => blur("postalCode")}
          error={show("postalCode")}
        />
        <TextAreaField
          id="shipping-notes"
          label="Delivery Notes"
          rows={3}
          maxLength={300}
          placeholder="Special delivery instructions"
          className="sm:col-span-2"
          value={shipping.notes}
          onChange={(e) => store.updateShipping({ notes: e.target.value })}
          onBlur={() => blur("notes")}
          error={show("notes")}
        />
      </div>
    </StepShell>
  );
}
