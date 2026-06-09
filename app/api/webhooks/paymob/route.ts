import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackObject } from "@/lib/paymob/hmac";
import type {
  PaymobCallbackTransaction,
  PaymobWebhookPayload,
} from "@/lib/paymob/types";
import type { Prisma } from "@prisma/client";

function logError(message: string): void {
  console.error(
    `[${new Date().toISOString()}] [ERROR] [webhooks/paymob]: ${message}`
  );
}

// Always 200 after this point so Paymob doesn't retry; processing errors are
// logged, not surfaced.
const OK = () => NextResponse.json({ received: true });

export async function POST(request: NextRequest) {
  const receivedHmac = request.nextUrl.searchParams.get("hmac");

  let payload: PaymobWebhookPayload;
  try {
    payload = (await request.json()) as PaymobWebhookPayload;
  } catch {
    logError("Invalid JSON body");
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const obj = payload?.obj as PaymobCallbackTransaction | undefined;
  if (!obj) {
    logError("Missing transaction object");
    return OK();
  }

  // 2. HMAC verification — reject anything unverified.
  const verified = verifyCallbackObject(
    obj as unknown as Record<string, unknown>,
    receivedHmac
  );
  if (!verified) {
    logError(`HMAC verification failed (transaction ${obj.id})`);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  try {
    const transactionId = String(obj.id);
    const merchantOrderId = obj.order?.merchant_order_id;
    const success = obj.success === true;
    const pending = obj.pending === true;

    // 5. Find our order by orderNumber (merchant_order_id), falling back to id.
    const order =
      (merchantOrderId
        ? await prisma.order.findFirst({
            where: {
              OR: [{ orderNumber: merchantOrderId }, { id: merchantOrderId }],
            },
          })
        : null) ?? null;

    if (!order) {
      logError(`No matching order for merchant_order_id=${merchantOrderId}`);
      return OK();
    }

    // 7. Idempotency: if we already recorded this transaction as SUCCESS, stop.
    const existingTx = await prisma.paymentTransaction.findUnique({
      where: { paymobTransactionId: transactionId },
    });
    if (existingTx && existingTx.status === "SUCCESS") {
      return OK();
    }

    const txStatus = success && !pending ? "SUCCESS" : pending ? "PENDING" : "FAILED";

    // 6. Record the transaction (full raw payload for audit).
    await prisma.paymentTransaction.upsert({
      where: { paymobTransactionId: transactionId },
      create: {
        orderId: order.id,
        paymobTransactionId: transactionId,
        paymobOrderId: String(obj.order?.id ?? order.paymobOrderId ?? ""),
        amount: obj.amount_cents ?? order.totalAmount ?? 0,
        currency: obj.currency ?? order.currency ?? "EGP",
        status: txStatus,
        paymentMethod: obj.source_data?.type ?? String(order.paymentMethod ?? ""),
        hmacVerified: true,
        rawCallbackData: payload as unknown as Prisma.InputJsonValue,
      },
      update: {
        status: txStatus,
        hmacVerified: true,
        rawCallbackData: payload as unknown as Prisma.InputJsonValue,
      },
    });

    // 8-10. Update the order based on the outcome.
    if (success && !pending) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING",
          paymentStatus: "PAID",
          paymobTransactionId: transactionId,
          paidAt: new Date(),
        },
      });
      // TODO: Add email confirmation service here (order marked PAID).
    } else if (pending) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "AWAITING_CONFIRMATION", paymentStatus: "UNPAID" },
      });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAYMENT_FAILED", paymentStatus: "FAILED" },
      });
    }

    return OK();
  } catch (error) {
    // 11. Log but still return 200 so Paymob does not retry.
    logError(error instanceof Error ? error.message : "unknown");
    return OK();
  }
}

export function GET() {
  return NextResponse.json(
    { success: false, error: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}
