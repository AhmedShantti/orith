import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  createParamDecorator,
} from "@nestjs/common";
import type { Request } from "express";
import { bearerFromHeader, verifyToken, JWTPayload } from "./jwt.util";

export interface AuthedRequest extends Request {
  user?: JWTPayload | null;
}

async function attachUser(req: AuthedRequest): Promise<JWTPayload | null> {
  const token = bearerFromHeader(req.headers["authorization"]);
  if (!token) {
    req.user = null;
    return null;
  }
  const payload = await verifyToken(token);
  req.user = payload;
  return payload;
}

/** Requires a valid token (mirrors requireAuth). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user = await attachUser(req);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        data: null,
        error: "Unauthorized",
        message: "No valid authentication token provided",
      });
    }
    return true;
  }
}

/** Requires a valid ADMIN token (mirrors requireAdmin). */
@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user = await attachUser(req);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        data: null,
        error: "Unauthorized",
        message: "No valid authentication token provided",
      });
    }
    if (user.role !== "ADMIN") {
      throw new ForbiddenException({
        success: false,
        data: null,
        error: "Forbidden",
        message: "Admin access required",
      });
    }
    return true;
  }
}

/** Never blocks; just attaches req.user if a valid token is present. */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    await attachUser(req);
    return true;
  }
}

/** Param decorator: inject the authenticated user (or null). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JWTPayload | null => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    return req.user ?? null;
  }
);
