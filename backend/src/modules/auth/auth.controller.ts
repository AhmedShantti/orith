import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard, CurrentUser } from "../../common/auth/guards";
import type { JWTPayload } from "../../common/auth/jwt.util";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(200)
  login(@Body() body: { email?: string; password?: string }) {
    return this.auth.login(body?.email, body?.password);
  }

  @Post("register")
  @HttpCode(201)
  register(@Body() body: { name?: string; email?: string; password?: string }) {
    return this.auth.register(body?.name, body?.email, body?.password);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JWTPayload) {
    return this.auth.me(user.userId);
  }
}
