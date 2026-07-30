import type { CanvasField, FieldOption, FieldValidations } from "../../types/field";
import type { RepeatableGroup } from "../../types/formStructure";
import {
  exportableOptions,
  isMultiValueField,
  isOptionBasedField,
} from "../fieldOptions/fieldOptions";

export function buildGroupZodSchema(group: RepeatableGroup, fields: CanvasField[]): string {
  const shape: string = fields
    .map((field) => `${JSON.stringify(field.name)}: ${buildZodSchema(field)}`)
    .join(", ");

  return `z.array(z.object({ ${shape} })).min(${group.min}).max(${group.max})`;
}

export function buildZodSchema(field: CanvasField): string {
  const v: FieldValidations = field.validations;
  let schema: string;

  if (isOptionBasedField(field.type)) {
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
        schema += `.regex(/${v.pattern}/${v.message ? `, { message: ${JSON.stringify(v.message)} }` : ""})`;
      }
  }

  if (!v.required && field.type !== "checkbox") {
    schema += ".optional()";
  }

  return schema;
}
