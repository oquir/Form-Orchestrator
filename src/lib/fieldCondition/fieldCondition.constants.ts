import type { ConditionOperator } from "../../types/field";

export const OPERATORS_WITHOUT_VALUE: ConditionOperator[] = [
  "isEmpty",
  "isNotEmpty",
  "isTruthy",
  "isFalsy",
];

export const LIST_OPERATORS: ConditionOperator[] = ["in"];

export const STRING_OPERATORS: ConditionOperator[] = [
  "startsWith",
  "endsWith",
  "contains",
  "matches",
  "in",
];
