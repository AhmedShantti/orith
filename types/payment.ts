// Payment transaction domain types.

export type TransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "VOIDED"
  | "REFUNDED";

export interface PaymentTransaction {
  id: string;
  orderId: string;
  paymobTransactionId: string;
  paymobOrderId: string;
  amount: number; // piastres
  currency: string;
  status: TransactionStatus;
  paymentMethod: string;
  hmacVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Shape returned to the success / failure landing pages. Intentionally minimal
// — never leaks customer or payment detail.
export interface PaymentVerifyResult {
  status: "PAID" | "FAILED" | "PENDING" | "NOT_FOUND";
  orderNumber?: string;
  orderId?: string;
  totalAmount?: number; // piastres
  currency?: string;
}
