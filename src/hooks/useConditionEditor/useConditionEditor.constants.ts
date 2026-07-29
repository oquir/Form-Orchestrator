import type { ConditionOperator } from "../../types/field";

export const OPERATORS_WITHOUT_VALUE: ConditionOperator[] = [
  "isEmpty",
  "isNotEmpty",
  "isTruthy",
  "isFalsy",
];

export const DEFAULT_OPERATORS: ConditionOperator[] = [
  "equals",
  "notEquals",
  "isEmpty",
  "isNotEmpty",
];
