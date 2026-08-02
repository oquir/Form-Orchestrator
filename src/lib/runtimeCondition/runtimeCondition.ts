import type { ExportedCondition } from "../../types/exportForm";
import type { RuntimeValues } from "../../types/formRuntime";
import { toFormulaNumber } from "../formula/formula";
import {
  isEmptyValue,
  isTruthyValue,
  looseEquals,
  toComparableText,
  toConditionList,
} from "./runtimeCondition.utils";

export function evaluateCondition(
  condition: ExportedCondition | undefined,
  values: RuntimeValues,
): boolean {
  if (!condition) return true;

  const observed: unknown = values[condition.field];
  const expected: unknown = condition.value;

  switch (condition.operator) {
    case "isEmpty":
      return isEmptyValue(observed);
    case "isNotEmpty":
      return !isEmptyValue(observed);
    case "isTruthy":
      return isTruthyValue(observed);
    case "isFalsy":
      return !isTruthyValue(observed);
    case "equals":
      return looseEquals(observed, expected);
    case "notEquals":
      return !looseEquals(observed, expected);
    case "greaterThan":
      return toFormulaNumber(observed) > toFormulaNumber(expected);
    case "lessThan":
      return toFormulaNumber(observed) < toFormulaNumber(expected);
    case "startsWith":
      return toComparableText(observed).startsWith(toComparableText(expected));
    case "endsWith":
      return toComparableText(observed).endsWith(toComparableText(expected));
    case "contains":
      return Array.isArray(observed)
        ? observed.map(toComparableText).includes(toComparableText(expected))
        : toComparableText(observed).includes(toComparableText(expected));
    case "in":
      return toConditionList(expected).includes(toComparableText(observed));
    case "matches":
      return matchesPattern(observed, expected);
    default:
      return true;
  }
}

export function evaluateConditions(
  conditions: ExportedCondition[],
  values: RuntimeValues,
  matchAll: boolean,
): boolean {
  if (conditions.length === 0) return true;

  return matchAll
    ? conditions.every((condition) => evaluateCondition(condition, values))
    : conditions.some((condition) => evaluateCondition(condition, values));
}

function matchesPattern(observed: unknown, expected: unknown): boolean {
  const source: string = toComparableText(expected);
  if (source === "") return true;

  try {
    return new RegExp(source).test(toComparableText(observed));
  } catch {
    return false;
  }
}
