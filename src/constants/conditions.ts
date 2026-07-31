import type { ConditionOperator } from "../types/field";

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: "es igual a",
  notEquals: "es distinto de",
  greaterThan: "es mayor que",
  lessThan: "es menor que",
  startsWith: "empieza con",
  endsWith: "termina en",
  contains: "contiene",
  matches: "coincide con la expresión",
  in: "está en la lista",
  isEmpty: "está vacío",
  isNotEmpty: "tiene un valor",
  isTruthy: "está marcado / es verdadero",
  isFalsy: "no está marcado / es falso",
};
