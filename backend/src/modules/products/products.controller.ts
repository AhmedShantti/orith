import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { AdminGuard } from "../../common/auth/guards";

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query("category") category?: string, @Query("q") q?: string) {
    return this.products.list(category, q);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.products.create(body);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.products.getOne(id);
  }

  @Put(":id")
  @UseGuards(AdminGuard)
  update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.products.update(id, body);
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  remove(@Param("id") id: string) {
    return this.products.remove(id);
  }
}
