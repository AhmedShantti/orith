import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { signToken } from "../../common/auth/jwt.util";

const SALT_ROUNDS = 10;

function toUser(u: {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email?: string, password?: string) {
    if (!email || !password) {
      throw new BadRequestException({
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required fields: email, password",
      });
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    const invalid = () =>
      new UnauthorizedException({
        success: false,
        data: null,
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    if (!user) throw invalid();
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw invalid();

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      success: true,
      data: { user: toUser(user), token },
      message: "Login successful",
    };
  }

  async register(name?: string, email?: string, password?: string) {
    if (!name || !email || !password) {
      throw new BadRequestException({
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required fields: name, email, password",
      });
    }
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({
        success: false,
        data: null,
        error: "Conflict",
        message: "User with this email already exists",
      });
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { name, email, password: hashed, role: "CUSTOMER" },
    });
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      success: true,
      data: { user: toUser(user), token },
      message: "User registered successfully",
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Not Found",
        message: "User not found",
      });
    }
    return { success: true, data: toUser(user) };
  }
}
