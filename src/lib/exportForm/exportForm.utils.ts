import type { CanvasField, FieldCondition } from "../../types/field";
import type { CanvasRow } from "../../types/formStructure";
import { operatorTakesList, parseConditionList } from "../fieldCondition/fieldCondition";
import type { ExportedCondition, ExportedRule } from "./exportForm.types";

export function buildNameIndex(rows: CanvasRow[]): Map<string, string> {
  const index: Map<string, string> = new Map();

  for (const row of rows) {
    for (const field of row.fields) {
      index.set(field.id, field.name);
    }
  }

  return index;
}

export function resolveCondition(
  condition: FieldCondition | undefined,
  names: Map<string, string>,
): ExportedCondition | undefined {
  if (!condition) return undefined;

  return {
    field: names.get(condition.fieldId) ?? condition.fieldId,
    operator: condition.operator,
    value: operatorTakesList(condition.operator)
      ? parseConditionList(condition.value)
      : condition.value,
  };
}

export function resolveDependencies(field: CanvasField, names: Map<string, string>): string[] {
  return field.logic.dependencies.map((id) => names.get(id) ?? id);
}

export function resolveRules(
  field: CanvasField,
  names: Map<string, string>,
): ExportedRule[] | undefined {
  if (!field.logic.rules || field.logic.rules.length === 0) return undefined;

  return field.logic.rules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    matchAll: rule.matchAll,
    when: rule.when.map((condition) => ({
      field: names.get(condition.fieldId) ?? condition.fieldId,
      operator: condition.operator,
      value: operatorTakesList(condition.operator)
        ? parseConditionList(condition.value)
        : condition.value,
    })),
    effects: rule.effects,
  }));
}
