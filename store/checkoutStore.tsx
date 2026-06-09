"use client";

// Checkout state slice. Matches the project's Context API pattern (see
// CartContext / LanguageContext). Persists to sessionStorage so a refresh
// mid-checkout doesn't lose progress, and invalidates itself when the cart
// changes.

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  ReactNode,
} from "react";
import { CHECKOUT_STATE_KEY } from "@/lib/checkout/constants";
import type {
  CheckoutState,
  CreatedOrder,
} from "@/types/checkout";
import type { AppliedCoupon } from "@/types/coupon";
import type { OrderStatus, PaymentMethod } from "@/types/order";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (very old browsers).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createInitialState(cartSignature: string): CheckoutState {
  return {
    currentStep: 1,
    completedSteps: [],
    customer: { firstName: "", lastName: "", email: "", phone: "" },
    shipping: {
      address1: "",
      address2: "",
      city: "",
      governorate: "",
      postalCode: "",
      notes: "",
      calculatedShippingFee: null,
    },
    coupon: { code: "", appliedCoupon: null, isValidating: false, error: null },
    payment: { method: null, walletPhone: "" },
    order: {
      id: null,
      orderNumber: null,
      status: null,
      idempotencyKey: "",
      isCreating: false,
      createError: null,
    },
    paymentInitiation: {
      isInitiating: false,
      error: null,
      redirectUrl: null,
      iframeUrl: null,
      paymentKey: null,
    },
    cartSignature,
  };
}

type Action =
  | { type: "HYDRATE"; state: CheckoutState }
  | { type: "SET_STEP"; step: number }
  | { type: "COMPLETE_STEP"; step: number }
  | { type: "UPDATE_CUSTOMER"; fields: Partial<CheckoutState["customer"]> }
  | { type: "UPDATE_SHIPPING"; fields: Partial<CheckoutState["shipping"]> }
  | { type: "SET_SHIPPING_FEE"; fee: number }
  | { type: "SET_COUPON_CODE"; code: string }
  | { type: "APPLY_COUPON"; coupon: AppliedCoupon }
  | { type: "REMOVE_COUPON" }
  | { type: "SET_COUPON_VALIDATING"; isValidating: boolean }
  | { type: "SET_COUPON_ERROR"; error: string | null }
  | { type: "SET_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "SET_WALLET_PHONE"; phone: string }
  | { type: "ENSURE_IDEMPOTENCY_KEY" }
  | { type: "SET_ORDER_CREATING"; isCreating: boolean }
  | { type: "SET_ORDER_CREATED"; order: CreatedOrder }
  | { type: "SET_ORDER_STATUS"; status: OrderStatus }
  | { type: "SET_ORDER_ERROR"; error: string | null }
  | { type: "SET_PAYMENT_INITIATING"; isInitiating: boolean }
  | {
      type: "SET_PAYMENT_INITIATED";
      urls: { redirectUrl?: string; iframeUrl?: string; paymentKey?: string };
    }
  | { type: "SET_PAYMENT_ERROR"; error: string | null }
  | { type: "RESET"; cartSignature: string };

function reducer(state: CheckoutState, action: Action): CheckoutState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "COMPLETE_STEP":
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.step)
          ? state.completedSteps
          : [...state.completedSteps, action.step].sort((a, b) => a - b),
      };
    case "UPDATE_CUSTOMER":
      return { ...state, customer: { ...state.customer, ...action.fields } };
    case "UPDATE_SHIPPING":
      return { ...state, shipping: { ...state.shipping, ...action.fields } };
    case "SET_SHIPPING_FEE":
      return {
        ...state,
        shipping: { ...state.shipping, calculatedShippingFee: action.fee },
      };
    case "SET_COUPON_CODE":
      return { ...state, coupon: { ...state.coupon, code: action.code } };
    case "APPLY_COUPON":
      return {
        ...state,
        coupon: {
          ...state.coupon,
          appliedCoupon: action.coupon,
          code: action.coupon.code,
          error: null,
          isValidating: false,
        },
      };
    case "REMOVE_COUPON":
      return {
        ...state,
        coupon: { code: "", appliedCoupon: null, isValidating: false, error: null },
      };
    case "SET_COUPON_VALIDATING":
      return {
        ...state,
        coupon: { ...state.coupon, isValidating: action.isValidating },
      };
    case "SET_COUPON_ERROR":
      return {
        ...state,
        coupon: { ...state.coupon, error: action.error, isValidating: false },
      };
    case "SET_PAYMENT_METHOD":
      return { ...state, payment: { ...state.payment, method: action.method } };
    case "SET_WALLET_PHONE":
      return { ...state, payment: { ...state.payment, walletPhone: action.phone } };
    case "ENSURE_IDEMPOTENCY_KEY":
      return state.order.idempotencyKey
        ? state
        : { ...state, order: { ...state.order, idempotencyKey: uuid() } };
    case "SET_ORDER_CREATING":
      return {
        ...state,
        order: {
          ...state.order,
          isCreating: action.isCreating,
          createError: action.isCreating ? null : state.order.createError,
        },
      };
    case "SET_ORDER_CREATED":
      return {
        ...state,
        order: {
          ...state.order,
          id: action.order.id,
          orderNumber: action.order.orderNumber,
          status: action.order.status,
          isCreating: false,
          createError: null,
        },
      };
    case "SET_ORDER_STATUS":
      return { ...state, order: { ...state.order, status: action.status } };
    case "SET_ORDER_ERROR":
      return {
        ...state,
        order: { ...state.order, createError: action.error, isCreating: false },
      };
    case "SET_PAYMENT_INITIATING":
      return {
        ...state,
        paymentInitiation: {
          ...state.paymentInitiation,
          isInitiating: action.isInitiating,
          error: action.isInitiating ? null : state.paymentInitiation.error,
        },
      };
    case "SET_PAYMENT_INITIATED":
      return {
        ...state,
        paymentInitiation: {
          ...state.paymentInitiation,
          isInitiating: false,
          error: null,
          redirectUrl: action.urls.redirectUrl ?? null,
          iframeUrl: action.urls.iframeUrl ?? null,
          paymentKey: action.urls.paymentKey ?? null,
        },
      };
    case "SET_PAYMENT_ERROR":
      return {
        ...state,
        paymentInitiation: {
          ...state.paymentInitiation,
          error: action.error,
          isInitiating: false,
        },
      };
    case "RESET":
      return createInitialState(action.cartSignature);
    default:
      return state;
  }
}

// Strip transient (loading/error) fields before persisting.
function serialize(state: CheckoutState): string {
  const persisted: CheckoutState = {
    ...state,
    coupon: { ...state.coupon, isValidating: false, error: null },
    order: { ...state.order, isCreating: false, createError: null },
    paymentInitiation: {
      isInitiating: false,
      error: null,
      redirectUrl: null,
      iframeUrl: null,
      paymentKey: null,
    },
  };
  return JSON.stringify(persisted);
}

export interface CheckoutStore {
  state: CheckoutState;
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  updateCustomer: (fields: Partial<CheckoutState["customer"]>) => void;
  updateShipping: (fields: Partial<CheckoutState["shipping"]>) => void;
  setShippingFee: (fee: number) => void;
  setCouponCode: (code: string) => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  setCouponValidating: (isValidating: boolean) => void;
  setCouponError: (error: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setWalletPhone: (phone: string) => void;
  ensureIdempotencyKey: () => void;
  setOrderCreating: (isCreating: boolean) => void;
  setOrderCreated: (order: CreatedOrder) => void;
  setOrderStatus: (status: OrderStatus) => void;
  setOrderError: (error: string | null) => void;
  setPaymentInitiating: (isInitiating: boolean) => void;
  setPaymentInitiated: (urls: {
    redirectUrl?: string;
    iframeUrl?: string;
    paymentKey?: string;
  }) => void;
  setPaymentError: (error: string | null) => void;
  resetCheckout: (cartSignature: string) => void;
}

const CheckoutContext = createContext<CheckoutStore | null>(null);

export function CheckoutProvider({
  children,
  cartSignature,
}: {
  children: ReactNode;
  cartSignature: string;
}) {
  const [state, dispatch] = useReducer(
    reducer,
    cartSignature,
    createInitialState
  );
  const hydrated = useRef(false);

  // Rehydrate once on mount — only if the persisted cart signature matches.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = sessionStorage.getItem(CHECKOUT_STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CheckoutState;
        if (parsed.cartSignature === cartSignature) {
          dispatch({ type: "HYDRATE", state: parsed });
          return;
        }
      }
    } catch {
      /* ignore corrupt drafts */
    }
    // No valid draft (or cart changed) → restart fresh for this cart.
    dispatch({ type: "RESET", cartSignature });
  }, [cartSignature]);

  // Persist on every change.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      sessionStorage.setItem(CHECKOUT_STATE_KEY, serialize(state));
    } catch {
      /* sessionStorage may be unavailable (private mode) */
    }
  }, [state]);

  const store: CheckoutStore = {
    state,
    setCurrentStep: (step) => dispatch({ type: "SET_STEP", step }),
    completeStep: (step) => dispatch({ type: "COMPLETE_STEP", step }),
    updateCustomer: (fields) => dispatch({ type: "UPDATE_CUSTOMER", fields }),
    updateShipping: (fields) => dispatch({ type: "UPDATE_SHIPPING", fields }),
    setShippingFee: (fee) => dispatch({ type: "SET_SHIPPING_FEE", fee }),
    setCouponCode: (code) => dispatch({ type: "SET_COUPON_CODE", code }),
    applyCoupon: (coupon) => dispatch({ type: "APPLY_COUPON", coupon }),
    removeCoupon: () => dispatch({ type: "REMOVE_COUPON" }),
    setCouponValidating: (isValidating) =>
      dispatch({ type: "SET_COUPON_VALIDATING", isValidating }),
    setCouponError: (error) => dispatch({ type: "SET_COUPON_ERROR", error }),
    setPaymentMethod: (method) => dispatch({ type: "SET_PAYMENT_METHOD", method }),
    setWalletPhone: (phone) => dispatch({ type: "SET_WALLET_PHONE", phone }),
    ensureIdempotencyKey: () => dispatch({ type: "ENSURE_IDEMPOTENCY_KEY" }),
    setOrderCreating: (isCreating) =>
      dispatch({ type: "SET_ORDER_CREATING", isCreating }),
    setOrderCreated: (order) => dispatch({ type: "SET_ORDER_CREATED", order }),
    setOrderStatus: (status) => dispatch({ type: "SET_ORDER_STATUS", status }),
    setOrderError: (error) => dispatch({ type: "SET_ORDER_ERROR", error }),
    setPaymentInitiating: (isInitiating) =>
      dispatch({ type: "SET_PAYMENT_INITIATING", isInitiating }),
    setPaymentInitiated: (urls) =>
      dispatch({ type: "SET_PAYMENT_INITIATED", urls }),
    setPaymentError: (error) => dispatch({ type: "SET_PAYMENT_ERROR", error }),
    resetCheckout: (sig) => {
      try {
        sessionStorage.removeItem(CHECKOUT_STATE_KEY);
      } catch {
        /* ignore */
      }
      dispatch({ type: "RESET", cartSignature: sig });
    },
  };

  return (
    <CheckoutContext.Provider value={store}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutStore(): CheckoutStore {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckoutStore must be used within a CheckoutProvider");
  }
  return ctx;
}
