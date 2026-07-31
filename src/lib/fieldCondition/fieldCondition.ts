import type { ConditionOperator } from "../../types/field";
import {
  LIST_OPERATORS,
  OPERATORS_WITHOUT_VALUE,
  STRING_OPERATORS,
} from "./fieldCondition.constants";

export function operatorNeedsValue(operator: ConditionOperator): boolean {
  return !OPERATORS_WITHOUT_VALUE.includes(operator);
}

export function operatorTakesList(operator: ConditionOperator): boolean {
  return LIST_OPERATORS.includes(operator);
}

export function operatorIsStringBased(operator: ConditionOperator): boolean {
  return STRING_OPERATORS.includes(operator);
}

export function parseConditionList(value: string | number | boolean | undefined): string[] {
  if (value === undefined) return [];

  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function operatorsForFieldType(type: string): ConditionOperator[] {
  switch (type) {
    case "checkbox":
      return ["isTruthy", "isFalsy"];
    case "number":
    case "calculated":
      return [
        "equals",
        "notEquals",
        "greaterThan",
        "lessThan",
        "startsWith",
        "endsWith",
        "contains",
        "matches",
        "in",
        "isEmpty",
        "isNotEmpty",
      ];
    case "select":
    case "search_select":
    case "toggle_group":
    case "radio_group":
      return ["equals", "notEquals", "in", "isEmpty", "isNotEmpty"];
    case "checkbox_group":
      return ["contains", "isEmpty", "isNotEmpty"];
    case "file":
      return ["isEmpty", "isNotEmpty"];
    default:
      return [
        "equals",
        "notEquals",
        "startsWith",
        "endsWith",
        "contains",
        "matches",
        "in",
        "isEmpty",
        "isNotEmpty",
      ];
  }
}
