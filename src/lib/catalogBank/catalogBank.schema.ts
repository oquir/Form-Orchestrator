import { z } from "zod";

const catalogEntrySchema = z.object({
  id: z.string(),
  label: z.string(),
  parentId: z.string().optional(),
});

export const catalogBankSchema = z.record(z.string(), z.array(catalogEntrySchema));
