import { z } from "zod";

const fechaLimiteSchema = z.object({
  periodo: z.number(),
  digito: z.number().optional(),
  fecha: z.string(),
});

const reglaAnioSchema = z.object({
  anio: z.number(),
  periodicidad: z.enum(["anual", "bimestral", "trimestral", "mensual"]),
  tipoDigito: z.enum(["ninguno", "primer_digito", "ultimo_digito"]),
  fechas: z.array(fechaLimiteSchema),
});

// Se exporta ademas del envoltorio porque es el mismo schema con el que se valida lo que alguien
// pega del endpoint: si el pegado y lo guardado se validaran distinto, entraria por una puerta algo
// que la otra rechaza.
export const fechasMaximasSchema = z.object({
  municipioId: z.union([z.number(), z.string()]),
  ica: z.array(reglaAnioSchema),
  reteica: z.array(reglaAnioSchema),
  autoretencionIca: z.array(reglaAnioSchema),
});

export const storedMaxDatesSchema = z.object({
  source: z.enum(["default", "custom"]),
  custom: fechasMaximasSchema.nullable(),
});
