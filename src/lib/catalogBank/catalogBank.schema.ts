import { z } from "zod";

const catalogEntrySchema = z.object({
  id: z.string(),
  label: z.string(),
  parentId: z.string().optional(),
  code: z.string().optional(),
  tarifa: z.number().optional(),
});

const storedCatalogSchema = z.object({
  source: z.enum(["default", "custom"]),
  entries: z.array(catalogEntrySchema),
});

export const catalogBankSchema = z.record(z.string(), storedCatalogSchema);
