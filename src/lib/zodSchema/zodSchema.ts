import type {
  CanvasField,
  FieldOption,
  FieldValidationOverride,
  FieldValidationRules,
} from "../../types/field";
import type { RepeatableGroup } from "../../types/formStructure";
import { isPresentationalField } from "../fieldKind/fieldKind";
import {
  exportableOptions,
  isMultiValueField,
  isOptionBasedField,
} from "../fieldOptions/fieldOptions";

// Genera el schema de Zod como texto, que es lo unico que viaja en el export. El consumidor lo
// ejecuta con new Function, asi que lo de aca tiene que ser una expresion valida por si sola.
// Ojo: no sabe nada de visibleWhen. Un campo obligatorio y oculto igual exporta su `.min(1)`,
// porque cuando se ve la exigencia es real; es el consumidor quien debe sacarlo del resolver.

export function buildGroupZodSchema(group: RepeatableGroup, fields: CanvasField[]): string {
  const shape: string = fields
    .filter((field) => !isPresentationalField(field.type))
    .map((field) => `${JSON.stringify(field.name)}: ${buildZodSchema(field)}`)
    .join(", ");

  return `z.array(z.object({ ${shape} })).min(${group.min}).max(${group.max})`;
}

export function buildZodSchema(field: CanvasField): string {
  return buildSchemaFor(field, field.validations);
}

// El schema de una variante condicional. Las reglas del override se fusionan sobre las de base:
// declarar solo `pattern` cambia el patron y deja el resto como estaba.
export function buildOverrideZodSchema(
  field: CanvasField,
  override: FieldValidationOverride,
): string {
  return buildSchemaFor(field, mergeValidationRules(field.validations, override.validations));
}

// Se ignoran las claves en undefined en vez de dejar que el spread las escriba: un override que
// trae `pattern: undefined` quiere decir "no toco el patron", no "borro el de base".
function mergeValidationRules(
  base: FieldValidationRules,
  patch: FieldValidationRules,
): FieldValidationRules {
  const merged: FieldValidationRules = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) (merged as Record<string, unknown>)[key] = value;
  }

  return merged;
}

function buildSchemaFor(field: CanvasField, v: FieldValidationRules): string {
  let schema: string;

  if (isOptionBasedField(field.type)) {
    // Solo se enumeran los valores de un campo excluido del payload, que es el unico caso en que
    // el builder los conoce. Uno mapeado recibe sus opciones del catalogo en tiempo de ejecucion,
    // asi que cae en z.string(): no se puede enumerar lo que no se ha visto.
    const options: FieldOption[] = exportableOptions(field) ?? [];
    const ids: string[] = options.map((option) => JSON.stringify(option.id));
    schema = ids.length > 0 ? `z.enum([${ids.join(", ")}])` : "z.string()";

    if (isMultiValueField(field.type)) {
      return v.required ? `z.array(${schema}).min(1)` : `z.array(${schema}).optional()`;
    }

    return v.required ? schema : `${schema}.optional()`;
  }

  switch (field.type) {
    case "number":
    case "calculated":
      schema = "z.number()";
      if (v.min !== undefined) schema += `.min(${v.min})`;
      if (v.max !== undefined) schema += `.max(${v.max})`;
      break;
    case "checkbox":
      schema = "z.boolean()";
      break;
    case "file": {
      const config = field.fileConfig ?? { acceptedFormats: [], maxSizeMB: 10 };
      const maxBytes = Math.floor(config.maxSizeMB * 1024 * 1024);
      schema = "z.instanceof(File)";
      schema += `.refine((f) => f.size <= ${maxBytes}, { message: "Máximo ${config.maxSizeMB}MB" })`;
      if (config.acceptedFormats.length > 0) {
        const acceptedJson = JSON.stringify(config.acceptedFormats);
        schema += `.refine((f) => { const accepted = ${acceptedJson}; return accepted.some((a) => a.startsWith(".") ? f.name.toLowerCase().endsWith(a.toLowerCase()) : a.endsWith("/*") ? f.type.startsWith(a.slice(0, -1)) : f.type === a); }, { message: "Formato no permitido" })`;
      }
      break;
    }
    default:
      schema = "z.string()";
      if (v.minLength !== undefined) schema += `.min(${v.minLength})`;
      if (v.maxLength !== undefined) schema += `.max(${v.maxLength})`;
      if (v.pattern) {
        const source: string = JSON.stringify(v.pattern);
        const message: string = v.message ? `, { message: ${JSON.stringify(v.message)} }` : "";
        schema += `.regex(new RegExp(${source})${message})`;
      }
  }

  // Que un campo sea obligatorio se expresa por omision: no se agrega `.optional()`. Es lo que
  // luego lee isRequiredBySchema para pintar el asterisco, ya que `required` no se exporta.
  if (!v.required && field.type !== "checkbox") {
    schema += ".optional()";
  }

  return schema;
}
