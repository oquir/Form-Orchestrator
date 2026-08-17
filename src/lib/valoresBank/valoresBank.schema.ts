import { z } from "zod";

// El mismo schema valida lo que se pega y lo que ya estaba guardado, igual que en el banco de
// fechas: si se validaran distinto, entraria por una puerta algo que la otra rechaza.
export const valorAnualSchema = z.object({
  anio: z.number().int().positive(),
  uvt: z.number().nonnegative(),
  smmlv: z.number().nonnegative(),
});

export const valoresAnualesSchema = z.array(valorAnualSchema);

export const storedValoresSchema = z.object({
  source: z.enum(["default", "custom"]),
  custom: valoresAnualesSchema.nullable(),
});
