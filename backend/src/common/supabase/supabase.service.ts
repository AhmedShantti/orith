import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
const MAX_BYTES = 5 * 1024 * 1024;

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  private get bucket(): string {
    return process.env.SUPABASE_STORAGE_BUCKET || "site-assets";
  }

  private getClient(): SupabaseClient {
    if (this.client) return this.client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "[FATAL] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for storage uploads"
      );
    }
    this.client = createClient(url, key, { auth: { persistSession: false } });
    return this.client;
  }

  /** Upload an image to the site-assets bucket and return its public URL. */
  async uploadImage(file: UploadedFile): Promise<string> {
    if (!file) throw new BadRequestException({ error: "No file provided" });
    if (!ALLOWED.includes(file.mimetype)) {
      throw new BadRequestException({
        error: "Unsupported image type (PNG, JPG, WEBP, AVIF, SVG, ICO)",
      });
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException({ error: "Image too large (max 5MB)" });
    }

    const ext = (file.originalname.split(".").pop() || "bin")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const path = `uploads/${Date.now().toString(36)}-${crypto
      .randomUUID()
      .slice(0, 8)}.${ext}`;

    const client = this.getClient();
    const { error } = await client.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) {
      this.logger.error(
        `[${new Date().toISOString()}] [ERROR] [Supabase:upload]: ${error.message}`
      );
      throw new BadRequestException({ error: "Upload failed" });
    }

    const { data } = client.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
