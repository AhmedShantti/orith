import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SupabaseService, UploadedFile } from "../../common/supabase/supabase.service";
import { ok } from "../../common/api-response";
import type { BulkUpdateSettingsInput } from "./site-settings.validation";

interface SettingRecord {
  key: string;
  value: string | null;
  type: string;
  section: string | null;
  label: string | null;
}

interface SettingsPayload {
  // Grouped by section for the dashboard UI.
  sections: Record<string, SettingRecord[]>;
  // Flat key -> value map for the storefront.
  map: Record<string, string | null>;
}

const CACHE_TTL_MS = 60 * 1000;

@Injectable()
export class SiteSettingsService {
  private cache: { data: SettingsPayload; expiresAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService
  ) {}

  private invalidate() {
    this.cache = null;
  }

  // GET /api/site-settings — grouped by section + flat map (cached).
  async getAll() {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return ok(this.cache.data);
    }

    const rows = await this.prisma.siteSetting.findMany({
      orderBy: [{ section: "asc" }, { key: "asc" }],
    });

    const sections: Record<string, SettingRecord[]> = {};
    const map: Record<string, string | null> = {};
    for (const r of rows) {
      const rec: SettingRecord = {
        key: r.key,
        value: r.value,
        type: r.type,
        section: r.section,
        label: r.label,
      };
      const section = r.section ?? "general";
      (sections[section] ??= []).push(rec);
      map[r.key] = r.value;
    }

    const data: SettingsPayload = { sections, map };
    this.cache = { data, expiresAt: now + CACHE_TTL_MS };
    return ok(data);
  }

  // GET /api/site-settings/:key
  async getByKey(key: string) {
    const row = await this.prisma.siteSetting.findUnique({ where: { key } });
    if (!row) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Setting not found",
      });
    }
    return ok(row);
  }

  // PATCH /api/site-settings — bulk update by key. Unknown keys are ignored.
  async bulkUpdate(input: BulkUpdateSettingsInput) {
    await this.prisma.$transaction(
      input.settings.map((s) =>
        this.prisma.siteSetting.updateMany({
          where: { key: s.key },
          data: { value: s.value ?? null },
        })
      )
    );
    this.invalidate();
    return ok({ updated: input.settings.length });
  }

  // POST /api/site-settings/upload — store image in Supabase, return public URL.
  async upload(file: UploadedFile) {
    const url = await this.supabase.uploadImage(file);
    return ok({ url });
  }
}
