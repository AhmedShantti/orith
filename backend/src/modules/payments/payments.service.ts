import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { paymobClient, PaymobAPIError } from "../../common/paymob/client";
import { applePayIframeUrl } from "../../common/paymob/constants";
import { paymobEnv } from "../../common/env";
import { normalizeEgyptPhone } from "../../common/checkout/orderHelpers";
import { CURRENCY } from "../../common/checkout/constants";
import type {
  PaymobBillingData,
  PaymobOrderItem,
  PaymobShippingData,
} from "../../common/paymob/types";
import type { PaymentVerifyResult } from "../../common/checkout/types";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async initiate(
    orderId: string,
    paymentMethod: "MOBILE_WALLET" | "APPLE_PAY",
    walletPhone?: string
  ) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) {
        throw new HttpException(
          { success: false, error: "ORDER_NOT_FOUND", message: "Order not found." },
          HttpStatus.NOT_FOUND
        );
      }
      if (order.paymentStatus === "PAID" || order.status === "PROCESSING") {
        throw new HttpException(
          {
            success: false,
            error: "ALREADY_PAID",
            message: "This order has already been paid.",
          },
          HttpStatus.CONFLICT
        );
      }
      if (paymentMethod === "MOBILE_WALLET" && !walletPhone) {
        throw new HttpException(
          {
            success: false,
            error: "WALLET_PHONE_REQUIRED",
            message: "A wallet phone number is required.",
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const amountCents = order.totalAmount ?? Math.round(order.total * 100);
      const authToken = await paymobClient.getAuthToken();

      let paymobOrderId = order.paymobOrderId ? Number(order.paymobOrderId) : null;
      if (!paymobOrderId) {
        const shippingData: PaymobShippingData = {
          first_name: order.customerFirstName ?? "NA",
          last_name: order.customerLastName ?? "NA",
          email: order.customerEmail ?? "NA",
          phone_number: order.customerPhone ?? "NA",
          city: order.shippingCity ?? "NA",
          country: "EG",
          state: order.shippingGovernorate ?? "NA",
          street: order.shippingAddress1 ?? "NA",
        };
        const items: PaymobOrderItem[] = order.items.map((it) => ({
          name: it.productName ?? "Item",
          amount_cents: it.unitPrice ?? Math.round(it.price * 100),
          description: it.variantName ?? "",
          quantity: it.quantity,
        }));
        const paymobOrder = await paymobClient.createOrder(authToken, {
          amountCents,
          currency: CURRENCY,
          merchantOrderId: order.orderNumber ?? order.id,
          items,
          shippingData,
        });
        paymobOrderId = paymobOrder.id;
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymobOrderId: String(paymobOrderId) },
        });
      }

      const integrationId =
        paymentMethod === "MOBILE_WALLET"
          ? paymobEnv.mobileWalletIntegrationId
          : paymobEnv.applePayIntegrationId;
      if (!integrationId) {
        throw new HttpException(
          {
            success: false,
            error: "PAYMENT_METHOD_UNAVAILABLE",
            message: "This payment method is not configured.",
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const billingData: PaymobBillingData = {
        first_name: order.customerFirstName ?? "NA",
        last_name: order.customerLastName ?? "NA",
        email: order.customerEmail ?? "NA",
        phone_number: order.customerPhone ?? "NA",
        apartment: "NA",
        floor: "NA",
        street: order.shippingAddress1 ?? "NA",
        building: "NA",
        shipping_method: "PKG",
        postal_code: order.shippingPostalCode || "NA",
        city: order.shippingCity ?? "NA",
        country: "EG",
        state: order.shippingGovernorate ?? "NA",
      };

      const paymentKey = await paymobClient.getPaymentKey({
        authToken,
        amountCents,
        orderId: paymobOrderId,
        billingData,
        integrationId,
        currency: CURRENCY,
      });

      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: "AWAITING_CONFIRMATION" },
      });

      if (paymentMethod === "MOBILE_WALLET") {
        const wallet = await paymobClient.initiateWalletPayment(
          paymentKey,
          normalizeEgyptPhone(walletPhone as string)
        );
        const redirectUrl =
          wallet.redirect_url || wallet.iframe_redirection_url || null;
        if (!redirectUrl) {
          this.logger.error("Wallet pay response missing redirect URL");
          throw new HttpException(
            {
              success: false,
              error: "PAYMENT_PROVIDER_ERROR",
              message:
                "We couldn't connect to the payment provider. Please try again in a few moments.",
            },
            HttpStatus.BAD_GATEWAY
          );
        }
        return { success: true, redirectUrl, orderId: order.id };
      }

      return {
        success: true,
        iframeUrl: applePayIframeUrl(paymobEnv.applePayIframeId, paymentKey),
        paymentKey,
        orderId: order.id,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof PaymobAPIError) {
        this.logger.error(`PaymobAPIError ${error.statusCode}: ${error.message}`);
        throw new HttpException(
          {
            success: false,
            error: "PAYMENT_PROVIDER_ERROR",
            message:
              "We couldn't connect to the payment provider. Please try again in a few moments.",
          },
          HttpStatus.BAD_GATEWAY
        );
      }
      this.logger.error(
        `initiate failed: ${error instanceof Error ? error.message : "unknown"}`
      );
      throw new HttpException(
        {
          success: false,
          error: "SERVER_ERROR",
          message: "Something went wrong on our end. Please try again.",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verify(transactionId: string): Promise<PaymentVerifyResult> {
    try {
      const tx = await this.prisma.paymentTransaction.findUnique({
        where: { paymobTransactionId: transactionId },
        include: { order: true },
      });
      const order =
        tx?.order ??
        (await this.prisma.order.findFirst({
          where: { paymobTransactionId: transactionId },
        }));
      if (!order) return { status: "NOT_FOUND" };

      let status: PaymentVerifyResult["status"];
      if (order.paymentStatus === "PAID") status = "PAID";
      else if (
        order.paymentStatus === "FAILED" ||
        order.status === "PAYMENT_FAILED"
      )
        status = "FAILED";
      else status = "PENDING";

      return {
        status,
        orderNumber: order.orderNumber ?? undefined,
        orderId: order.id,
        totalAmount: order.totalAmount ?? undefined,
        currency: order.currency ?? undefined,
      };
    } catch (error) {
      this.logger.error(
        `verify failed: ${error instanceof Error ? error.message : "unknown"}`
      );
      return { status: "NOT_FOUND" };
    }
  }
}
