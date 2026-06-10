// Zod schema for the bulk settings update (this project validates with Zod via
// ZodValidationPipe rather than class-validator DTOs).

import { z } from "zod";

export const bulkUpdateSettingsSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string().min(1).max(100),
        value: z.string().nullable().optional(),
      })
    )
    .min(1, "No settings provided"),
});

export type BulkUpdateSettingsInput = z.infer<typeof bulkUpdateSettingsSchema>;
