import type { CanvasField } from "../../types/storeTypes";

export function buildZodSchema(field: CanvasField): string {
  const v = field.validations;
  let schema: string;

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
    case "toggle_group": {
      const optionIds = (field.options ?? []).map((option) => JSON.stringify(option.id));
      schema = optionIds.length > 0 ? `z.enum([${optionIds.join(", ")}])` : "z.string()";
      break;
    }
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
