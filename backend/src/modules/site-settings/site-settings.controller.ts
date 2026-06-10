import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SiteSettingsService } from "./site-settings.service";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  bulkUpdateSettingsSchema,
  BulkUpdateSettingsInput,
} from "./site-settings.validation";
import { AdminGuard } from "../../common/auth/guards";
import type { UploadedFile as UploadedFileType } from "../../common/supabase/supabase.service";

@Controller("site-settings")
export class SiteSettingsController {
  constructor(private readonly settings: SiteSettingsService) {}

  // Public — the storefront reads these on every page render.
  @Get()
  getAll() {
    return this.settings.getAll();
  }

  // Admin write — bulk update. Declared before ":key" GET (different verb, but
  // keep the static "upload" route above the param route for clarity).
  @Patch()
  @UseGuards(AdminGuard)
  update(
    @Body(new ZodValidationPipe(bulkUpdateSettingsSchema))
    body: BulkUpdateSettingsInput
  ) {
    return this.settings.bulkUpdate(body);
  }

  @Post("upload")
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor("file"))
  upload(@UploadedFile() file: UploadedFileType) {
    return this.settings.upload(file);
  }

  @Get(":key")
  getByKey(@Param("key") key: string) {
    return this.settings.getByKey(key);
  }
}
