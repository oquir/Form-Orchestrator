import type { EnableOperator } from "../../../../types/storeTypes";

export const OPERATOR_LABELS: Record<EnableOperator, string> = {
  equals: "es igual a",
  notEquals: "es distinto de",
  greaterThan: "es mayor que",
  lessThan: "es menor que",
  isEmpty: "está vacío",
  isNotEmpty: "tiene un valor",
  isTruthy: "está marcado / es verdadero",
  isFalsy: "no está marcado / es falso",
};

export const OPERATORS_WITHOUT_VALUE: EnableOperator[] = [
  "isEmpty",
  "isNotEmpty",
  "isTruthy",
  "isFalsy",
];
