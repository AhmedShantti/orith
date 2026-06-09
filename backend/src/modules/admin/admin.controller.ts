import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminGuard } from "../../common/auth/guards";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("orders")
  orders(
    @Query("status") status?: string,
    @Query("page") page = "1",
    @Query("limit") limit = "15"
  ) {
    return this.admin.orders(
      status,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 15
    );
  }

  @Get("stats")
  stats() {
    return this.admin.stats();
  }

  @Get("customers")
  customers(
    @Query("search") search?: string,
    @Query("page") page = "1",
    @Query("limit") limit = "15"
  ) {
    return this.admin.customers(
      search,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 15
    );
  }

  @Get("reviews")
  reviews(
    @Query("rating") rating?: string,
    @Query("page") page = "1",
    @Query("limit") limit = "15"
  ) {
    return this.admin.reviews(
      rating,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 15
    );
  }

  @Delete("reviews/:id")
  deleteReview(@Param("id") id: string) {
    return this.admin.deleteReview(id);
  }
}
