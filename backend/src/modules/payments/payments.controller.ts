import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  initiatePaymentSchema,
  InitiatePaymentInput,
} from "../../common/checkout/validation";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post("initiate")
  initiate(
    @Body(new ZodValidationPipe(initiatePaymentSchema))
    body: InitiatePaymentInput
  ) {
    return this.payments.initiate(
      body.orderId,
      body.paymentMethod,
      body.walletPhone || undefined
    );
  }

  @Get("verify/:transactionId")
  verify(@Param("transactionId") transactionId: string) {
    return this.payments.verify(transactionId);
  }
}
