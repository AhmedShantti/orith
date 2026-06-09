import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { verifyCallbackObject } from "../../common/paymob/hmac";
import type {
  PaymobCallbackTransaction,
  PaymobWebhookPayload,
} from "../../common/paymob/types";

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  async handlePaymob(
    payload: PaymobWebhookPayload,
    receivedHmac: string | null,
    prisma: PrismaService
  ): Promise<{ received: boolean }> {
    const obj = payload?.obj as PaymobCallbackTransaction | undefined;
    if (!obj) {
      this.logger.error("Missing transaction object");
      return { received: true };
    }

    // HMAC verification — reject anything unverified.
    const verified = verifyCallbackObject(
      obj as unknown as Record<string, unknown>,
      receivedHmac
    );
    if (!verified) {
      this.logger.error(`HMAC verification failed (transaction ${obj.id})`);
      throw new UnauthorizedException({ error: "invalid signature" });
    }

    try {
      const transactionId = String(obj.id);
      const merchantOrderId = obj.order?.merchant_order_id;
      const success = obj.success === true;
      const pending = obj.pending === true;

      const order = merchantOrderId
        ? await prisma.order.findFirst({
            where: {
              OR: [{ orderNumber: merchantOrderId }, { id: merchantOrderId }],
            },
          })
        : null;

      if (!order) {
        this.logger.error(
          `No matching order for merchant_order_id=${merchantOrderId}`
        );
        return { received: true };
      }

      const existingTx = await prisma.paymentTransaction.findUnique({
        where: { paymobTransactionId: transactionId },
      });
      if (existingTx && existingTx.status === "SUCCESS") {
        return { received: true };
      }

      const txStatus =
        success && !pending ? "SUCCESS" : pending ? "PENDING" : "FAILED";

      await prisma.paymentTransaction.upsert({
        where: { paymobTransactionId: transactionId },
        create: {
          orderId: order.id,
          paymobTransactionId: transactionId,
          paymobOrderId: String(obj.order?.id ?? order.paymobOrderId ?? ""),
          amount: obj.amount_cents ?? order.totalAmount ?? 0,
          currency: obj.currency ?? order.currency ?? "EGP",
          status: txStatus,
          paymentMethod:
            obj.source_data?.type ?? String(order.paymentMethod ?? ""),
          hmacVerified: true,
          rawCallbackData: payload as unknown as Prisma.InputJsonValue,
        },
        update: {
          status: txStatus,
          hmacVerified: true,
          rawCallbackData: payload as unknown as Prisma.InputJsonValue,
        },
      });

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

      return { received: true };
    } catch (error) {
      // Always 200 so Paymob does not retry; log the failure.
      this.logger.error(
        `webhook processing failed: ${
          error instanceof Error ? error.message : "unknown"
        }`
      );
      return { received: true };
    }
  }
}
