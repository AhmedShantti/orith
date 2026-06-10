// Zod schemas for all checkout form data. Shared by client (inline validation)
// and server (authoritative validation).

import { z } from "zod";
import { EGYPTIAN_GOVERNORATES, EGYPT_PHONE_REGEX } from "./constants";

export const customerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(100),
  phone: z
    .string()
    .trim()
    .regex(EGYPT_PHONE_REGEX, "Please enter a valid Egyptian phone number"),
});

export const shippingSchema = z.object({
  address1: z.string().trim().min(10, "Please enter your full address").max(200),
  address2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  governorate: z.enum(
    EGYPTIAN_GOVERNORATES as unknown as [string, ...string[]],
    { message: "Please select a governorate" }
  ),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Postal code must be 5 digits")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const walletPhoneSchema = z
  .string()
  .trim()
  .regex(EGYPT_PHONE_REGEX, "Please enter a valid Egyptian phone number");

export const lineItemSchema = z.object({
  productId: z.string().min(1),
  variantName: z.string().optional(),
  quantity: z.number().int().positive().max(99),
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.number().int().nonnegative(),
});

export const createOrderSchema = z.object({
  idempotencyKey: z.string().uuid("Invalid idempotency key"),
  customer: customerSchema,
  shipping: shippingSchema,
  items: z.array(lineItemSchema).min(1, "Cart is empty"),
  couponCode: z.string().trim().optional().or(z.literal("")),
  // Accepted payment methods. (Zod enum is this project's equivalent of a
  // class-validator @IsIn(['MOBILE_WALLET', 'COD', ...]) check.) COD needs no
  // payment processing; the wallet phone is only required for MOBILE_WALLET.
  paymentMethod: z.enum(["MOBILE_WALLET", "APPLE_PAY", "COD"]),
  walletPhone: z.string().trim().optional().or(z.literal("")),
}).refine(
  (data) =>
    data.paymentMethod !== "MOBILE_WALLET" ||
    (data.walletPhone != null &&
      EGYPT_PHONE_REGEX.test(data.walletPhone)),
  {
    message: "A valid wallet phone number is required for mobile wallet",
    path: ["walletPhone"],
  }
);

export const initiatePaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentMethod: z.enum(["MOBILE_WALLET", "APPLE_PAY"]),
  walletPhone: z.string().trim().optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type ShippingInput = z.infer<typeof shippingSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
