// TypeScript interfaces for the Paymob Accept API.

export interface PaymobBillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  shipping_method: string;
  postal_code: string;
  city: string;
  country: string;
  state: string;
}

export interface PaymobOrderItem {
  name: string;
  amount_cents: number;
  description: string;
  quantity: number;
}

export interface PaymobShippingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  city: string;
  country: string;
  state: string;
  street: string;
}

export interface PaymobOrderParams {
  amountCents: number;
  currency: string;
  merchantOrderId: string;
  items: PaymobOrderItem[];
  shippingData: PaymobShippingData;
}

export interface PaymobOrderResponse {
  id: number;
  [key: string]: unknown;
}

export interface PaymobPaymentKeyParams {
  authToken: string;
  amountCents: number;
  orderId: number;
  billingData: PaymobBillingData;
  integrationId: string;
  currency: string;
  expiration?: number;
}

export interface PaymobPaymentKeyResponse {
  token: string;
  [key: string]: unknown;
}

export interface PaymobWalletResponse {
  redirect_url?: string;
  iframe_redirection_url?: string;
  pending?: boolean;
  id?: number;
  [key: string]: unknown;
}

// The transaction-processed callback object Paymob POSTs to our webhook.
export interface PaymobCallbackTransaction {
  id: number;
  pending: boolean;
  success: boolean;
  amount_cents: number;
  currency: string;
  integration_id: number;
  order: {
    id: number;
    merchant_order_id: string;
    [key: string]: unknown;
  };
  source_data?: {
    pan?: string;
    sub_type?: string;
    type?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface PaymobWebhookPayload {
  type: string;
  obj: PaymobCallbackTransaction;
  [key: string]: unknown;
}
