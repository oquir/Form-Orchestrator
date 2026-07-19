import type { EnableOperator } from "../../types/storeTypes";

export const OPERATORS_WITHOUT_VALUE: EnableOperator[] = [
  "isEmpty",
  "isNotEmpty",
  "isTruthy",
  "isFalsy",
];

export const DEFAULT_OPERATORS: EnableOperator[] = ["equals", "notEquals", "isEmpty", "isNotEmpty"];
