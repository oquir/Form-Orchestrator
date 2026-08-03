import type { z } from "zod";
import type { ExportedField } from "../../types/exportForm";
import type {
  RuntimeIssue,
  RuntimeModel,
  RuntimeScope,
  RuntimeSnapshot,
  ValidationResult,
} from "../../types/formRuntime";
import { isPresentationalField } from "../fieldKind/fieldKind";
import { firstZodMessage, hydrateFieldSchemas } from "../zodHydrate/zodHydrate";
import { coerceValue, fieldKey } from "./runtimeValidation.utils";

// Valida todo el formulario contra los schemas de Zod hidratados desde el export.
// Devuelve dos cosas distintas: `errors` es lo que el usuario hizo mal llenando el formulario,
// `issues` es lo que esta mal en el formulario en si (un schema que no compila, un ciclo).
export function validateRuntime(model: RuntimeModel, snapshot: RuntimeSnapshot): ValidationResult {
  const groupFields: ExportedField[] = [...model.groupFields.values()].flat();
  const { schemas, issues } = hydrateFieldSchemas([...model.rootFields, ...groupFields]);
  const errors: Record<string, string> = {};

  collectErrors(model.rootFields, snapshot.root, schemas, errors);

  for (const [groupId, fields] of model.groupFields) {
    (snapshot.groups[groupId] ?? []).forEach((scope, index) => {
      collectErrors(fields, scope, schemas, errors, groupId, index);
    });
  }

  return { errors, issues: [...issues, ...cycleIssues(snapshot)] };
}

function collectErrors(
  fields: ExportedField[],
  scope: RuntimeScope,
  schemas: Map<string, z.ZodType>,
  errors: Record<string, string>,
  groupId?: string,
  index?: number,
): void {
  for (const field of fields) {
    // Un campo presentacional no tiene valor que validar, y el export ni siquiera le pone schema.
    if (isPresentationalField(field.type)) continue;
    // Un campo oculto no se renderiza ni se valida: es la precedencia del contrato.
    if (!scope.visible[field.name]) continue;

    const schema: z.ZodType | undefined = schemas.get(field.name);
    if (!schema) continue;

    const result = schema.safeParse(coerceValue(field, scope.values[field.name]));
    if (!result.success) {
      errors[fieldKey(field.name, groupId, index)] = firstZodMessage(result.error);
    }
  }
}

function cycleIssues(snapshot: RuntimeSnapshot): RuntimeIssue[] {
  if (!snapshot.cycle) return [];

  return [
    {
      kind: "cycle",
      message: `Dependencia circular entre: ${snapshot.cycle.join(", ")}. Esos campos no se calculan.`,
    },
  ];
}
