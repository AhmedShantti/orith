import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { JwtAuthGuard, CurrentUser } from "../../common/auth/guards";
import type { JWTPayload } from "../../common/auth/jwt.util";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: JWTPayload,
    @Body() body: { productId?: string; rating?: number; comment?: string }
  ) {
    return this.reviews.create(user.userId, body);
  }

  @Get(":productId")
  list(
    @Param("productId") productId: string,
    @Query("page") page = "1",
    @Query("limit") limit = "10"
  ) {
    return this.reviews.listForProduct(
      productId,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 10
    );
  }
}
