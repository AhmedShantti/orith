import {
  Body,
  Controller,
  HttpCode,
  Post,
  Query,
} from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { PrismaService } from "../../prisma/prisma.service";
import type { PaymobWebhookPayload } from "../../common/paymob/types";

@Controller("webhooks")
export class WebhooksController {
  constructor(
    private readonly webhooks: WebhooksService,
    private readonly prisma: PrismaService
  ) {}

  // POST /api/webhooks/paymob?hmac=...
  // Authenticated solely by the HMAC signature — no bearer auth.
  @Post("paymob")
  @HttpCode(200)
  paymob(
    @Body() payload: PaymobWebhookPayload,
    @Query("hmac") hmac?: string
  ) {
    return this.webhooks.handlePaymob(payload, hmac ?? null, this.prisma);
  }
}
