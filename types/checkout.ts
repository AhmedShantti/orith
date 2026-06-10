// Checkout-flow types: the in-page multi-step state machine and its actions.

import { AppliedCoupon } from "./coupon";
import { OrderStatus, PaymentMethod, PaymentStatus } from "./order";

export type CheckoutStep = 1 | 2 | 3 | 4 | 5;

export interface CheckoutCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CheckoutShipping {
  address1: string;
  address2: string;
  city: string;
  governorate: string;
  postalCode: string;
  notes: string;
  calculatedShippingFee: number | null; // piastres, null = not yet calculated
}

export interface CheckoutCouponState {
  code: string;
  appliedCoupon: AppliedCoupon | null;
  isValidating: boolean;
  error: string | null;
}

export interface CheckoutPaymentState {
  method: PaymentMethod | null;
  walletPhone: string;
}

export interface CheckoutOrderState {
  id: string | null;
  orderNumber: string | null;
  status: OrderStatus | null;
  idempotencyKey: string;
  isCreating: boolean;
  createError: string | null;
}

export interface CheckoutPaymentInitiationState {
  isInitiating: boolean;
  error: string | null;
  redirectUrl: string | null;
  iframeUrl: string | null;
  paymentKey: string | null;
}

export interface CheckoutState {
  currentStep: number;
  completedSteps: number[];
  customer: CheckoutCustomer;
  shipping: CheckoutShipping;
  coupon: CheckoutCouponState;
  payment: CheckoutPaymentState;
  order: CheckoutOrderState;
  paymentInitiation: CheckoutPaymentInitiationState;
  /** Signature of the cart contents this checkout state was created for. Used
   *  to invalidate the persisted draft when the cart changes. */
  cartSignature: string;
}

// Lightweight item shape sent to the create-order API. The server re-fetches
// authoritative pricing — never trust amounts from the client.
export interface CheckoutLineItemInput {
  productId: string;
  variantName?: string;
  quantity: number;
}

export interface CreatedOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | null;
  paymentStatus?: PaymentStatus | null;
  breakdown: {
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    totalAmount: number;
  };
}
