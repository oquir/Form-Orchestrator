import type { ConditionOperator } from "../../../types/field";

export const FIELD_CLASSES: string =
  "rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const OPERATOR_VALUE_HINTS: Partial<Record<ConditionOperator, string>> = {
  startsWith: "Se compara sobre el valor como texto.",
  endsWith: "Se compara sobre el valor como texto. Ej: 2 para un NIT terminado en 2.",
  contains: "Se compara sobre el valor como texto.",
  matches: "Expresión regular sin barras. Ej: [0-9]{3}$",
  in: "Valores separados por coma. Se exporta como lista.",
};
