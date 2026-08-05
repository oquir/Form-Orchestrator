import { z } from "zod";
import type { ExportedField } from "../../types/exportForm";
import type { RuntimeIssue } from "../../types/formRuntime";

export interface HydratedSchema {
  schema: z.ZodType | null;
  error: string | null;
}

// Es el unico camino que tiene el consumidor: el export solo lleva el schema como string,
// no las validaciones crudas. Simularlo aca es lo que hace fiel a la vista previa.
// El fallo se devuelve como texto en vez de propagarse: un schema mal escrito tiene que verse
// como un problema de ese campo, no tumbar el formulario entero.
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

// El mapa va indexado por el texto del schema y no por el nombre del campo, porque un campo con
// variantes condicionales tiene mas de uno y cual aplica depende de lo que el usuario lleve
// escrito. Como efecto secundario, dos campos con el mismo schema comparten el validador.
export function hydrateFieldSchemas(fields: ExportedField[]): {
  schemas: Map<string, z.ZodType>;
  issues: RuntimeIssue[];
} {
  const schemas: Map<string, z.ZodType> = new Map();
  const issues: RuntimeIssue[] = [];

  for (const field of fields) {
    const sources: (string | undefined)[] = [
      field.validations.zodSchema,
      ...(field.validations.zodSchemaWhen ?? []).map((variant) => variant.zodSchema),
    ];

    for (const source of sources) {
      if (source === undefined || schemas.has(source)) continue;

      const { schema, error } = hydrateZodSchema(source);

      if (error) {
        issues.push({ kind: "schema", field: field.name, message: error });
        continue;
      }

      if (schema) schemas.set(source, schema);
    }
  }

  return { schemas, issues };
}

export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Valor inválido";
}
