import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { JwtAuthGuard, CurrentUser } from "../../common/auth/guards";
import type { JWTPayload } from "../../common/auth/jwt.util";

@Controller("cart")
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  list(@CurrentUser() user: JWTPayload) {
    return this.cart.list(user.userId);
  }

  @Post()
  @HttpCode(201)
  add(
    @CurrentUser() user: JWTPayload,
    @Body() body: { productId?: string; quantity?: number }
  ) {
    return this.cart.add(user.userId, body?.productId, body?.quantity);
  }

  @Delete()
  clear(@CurrentUser() user: JWTPayload) {
    return this.cart.clear(user.userId);
  }

  @Put(":productId")
  update(
    @CurrentUser() user: JWTPayload,
    @Param("productId") productId: string,
    @Body() body: { quantity?: number }
  ) {
    return this.cart.updateItem(user.userId, productId, body?.quantity);
  }

  @Delete(":productId")
  remove(
    @CurrentUser() user: JWTPayload,
    @Param("productId") productId: string
  ) {
    return this.cart.removeItem(user.userId, productId);
  }
}
