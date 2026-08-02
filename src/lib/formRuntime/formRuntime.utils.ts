import type { ExportedField, ExportedStep } from "../../types/exportForm";
import type { RuntimeModel, RuntimeScope, RuntimeValues } from "../../types/formRuntime";
import { evaluateCondition } from "../runtimeCondition/runtimeCondition";

export function stepFields(step: ExportedStep): ExportedField[] {
  return step.rows.flatMap((row) => row.fields);
}

export function allSteps(model: RuntimeModel): ExportedStep[] {
  return [...model.introSteps, ...model.steps];
}

export function groupColumns(
  model: RuntimeModel,
  groups: Record<string, RuntimeValues[]>,
): RuntimeValues {
  const columns: RuntimeValues = {};

  for (const [groupId, fields] of model.groupFields) {
    const items: RuntimeValues[] = groups[groupId] ?? [];

    for (const field of fields) {
      columns[field.name] = items.map((item) => item[field.name]);
    }
  }

  return columns;
}

export function buildScope(
  fields: ExportedField[],
  values: RuntimeValues,
  computed: Record<string, boolean>,
): RuntimeScope {
  const visible: Record<string, boolean> = {};
  const disabled: Record<string, boolean> = {};

  for (const field of fields) {
    visible[field.name] = evaluateCondition(field.visibleWhen, values);
    disabled[field.name] =
      Boolean(field.alwaysDisabled) || !evaluateCondition(field.enableWhen, values);
  }

  return { values, visible, disabled, computed };
}

export function emptyItem(fields: ExportedField[]): RuntimeValues {
  const item: RuntimeValues = {};

  for (const field of fields) item[field.name] = undefined;

  return item;
}
