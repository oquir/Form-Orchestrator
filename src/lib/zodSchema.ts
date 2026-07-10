import type { CanvasField } from "../types/storeTypes";

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
