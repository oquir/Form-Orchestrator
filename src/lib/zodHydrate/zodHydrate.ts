import { z } from "zod";
import type { ExportedField } from "../../types/exportForm";
import type { RuntimeIssue } from "../../types/formRuntime";

export interface HydratedSchema {
  schema: z.ZodType | null;
  error: string | null;
}

// Es el unico camino que tiene el consumidor: el export solo lleva el schema como string,
// no las validaciones crudas. Simularlo aca es lo que hace fiel a la vista previa.
export function hydrateZodSchema(source: string | undefined): HydratedSchema {
  if (!source || source.trim() === "") return { schema: null, error: null };

  try {
    const factory = new Function("z", `return (${source});`) as (zod: typeof z) => z.ZodType;
    const schema: z.ZodType = factory(z);

    if (typeof schema?.safeParse !== "function") {
      return { schema: null, error: "El schema no produjo un validador de Zod." };
    }

    return { schema, error: null };
  } catch (error) {
    return { schema: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export function hydrateFieldSchemas(fields: ExportedField[]): {
  schemas: Map<string, z.ZodType>;
  issues: RuntimeIssue[];
} {
  const schemas: Map<string, z.ZodType> = new Map();
  const issues: RuntimeIssue[] = [];

  for (const field of fields) {
    const { schema, error } = hydrateZodSchema(field.validations.zodSchema);

    if (error) {
      issues.push({ kind: "schema", field: field.name, message: error });
      continue;
    }

    if (schema) schemas.set(field.name, schema);
  }

  return { schemas, issues };
}

export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Valor inválido";
}
