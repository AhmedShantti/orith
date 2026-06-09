import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PaymentVerifyResult } from "@/types/payment";

// GET /api/payments/verify/[transactionId]
// Lets the success/failure pages verify status WITHOUT trusting URL params.
// Returns order number + amount only — never customer detail.
export async function GET(
  _request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  const transactionId = params.transactionId;

  try {
    const tx = await prisma.paymentTransaction.findUnique({
      where: { paymobTransactionId: transactionId },
      include: { order: true },
    });

    const order =
      tx?.order ??
      (await prisma.order.findFirst({
        where: { paymobTransactionId: transactionId },
      }));

    if (!order) {
      const result: PaymentVerifyResult = { status: "NOT_FOUND" };
      return NextResponse.json(result);
    }

    let status: PaymentVerifyResult["status"];
    if (order.paymentStatus === "PAID") status = "PAID";
    else if (order.paymentStatus === "FAILED" || order.status === "PAYMENT_FAILED")
      status = "FAILED";
    else status = "PENDING";

    const result: PaymentVerifyResult = {
      status,
      orderNumber: order.orderNumber ?? undefined,
      orderId: order.id,
      totalAmount: order.totalAmount ?? undefined,
      currency: order.currency ?? undefined,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [payments/verify]: ${
        error instanceof Error ? error.message : "unknown"
      }`
    );
    return NextResponse.json(
      { status: "NOT_FOUND" } satisfies PaymentVerifyResult,
      { status: 500 }
    );
  }
}
