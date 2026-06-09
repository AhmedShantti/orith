import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

// Uploaded images are written into the Next.js frontend's public/products dir
// (one level up from the backend) so they're served at /products/<file>.
// Override with UPLOAD_DIR if the frontend lives elsewhere.
const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  path.resolve(process.cwd(), "..", "public", "products");

@Controller("upload")
export class UploadController {
  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file"))
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ error: "No file provided" });
    }
    if (!ALLOWED.includes(file.mimetype)) {
      throw new BadRequestException({
        error: "Unsupported image type (use PNG, JPG, WEBP or AVIF)",
      });
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException({ error: "Image too large (max 5MB)" });
    }
    const filename = `upload-${Date.now().toString(36)}.${EXT[file.mimetype]}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
    return { path: `/products/${filename}` };
  }
}
