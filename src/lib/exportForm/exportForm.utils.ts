import type { CanvasField, FieldCondition } from "../../types/field";
import type { CanvasRow } from "../../types/formStructure";
import type { ExportedCondition } from "./exportForm.types";

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
    value: condition.value,
  };
}

export function resolveDependencies(field: CanvasField, names: Map<string, string>): string[] {
  return field.logic.dependencies.map((id) => names.get(id) ?? id);
}
