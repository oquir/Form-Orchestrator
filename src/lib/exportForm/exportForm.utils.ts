import type { CanvasField, FieldCondition } from "../../types/field";
import type { CanvasRow, FormStep } from "../../types/formStructure";
import { operatorTakesList, parseConditionList } from "../fieldCondition/fieldCondition";
import { exportableOptions } from "../fieldOptions/fieldOptions";
import { groupFields } from "../repeatableGroup/repeatableGroup";
import { buildGroupZodSchema, buildZodSchema } from "../zodSchema/zodSchema";
import type {
  ExportedCondition,
  ExportedRepeatableGroup,
  ExportedRow,
  ExportedRule,
  ExportedStep,
} from "./exportForm.types";

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

export function mapRows(rows: CanvasRow[], names: Map<string, string>): ExportedRow[] {
  return rows.map((row) => ({
    rowId: row.id,
    columns: row.columns,
    groupId: row.groupId,
    fields: row.fields.map((field) => ({
      fieldId: field.id,
      name: field.name,
      type: field.type,
      label: field.label,
      colStart: field.colStart,
      colSpan: field.colSpan,
      styles: field.styles,
      validations: { zodSchema: buildZodSchema(field) },
      logic: {
        dependencies: resolveDependencies(field, names),
        typeScript: field.logic.typeScript,
        formula: field.logic.formula,
        rules: resolveRules(field, names),
      },
      title: field.title,
      options: exportableOptions(field),
      fileConfig: field.fileConfig,
      alwaysDisabled: field.alwaysDisabled,
      enableWhen: resolveCondition(field.enableWhen, names),
      visibleWhen: resolveCondition(field.visibleWhen, names),
      apiBinding: field.apiBinding,
    })),
  }));
}

export function mapGroups(step: FormStep): ExportedRepeatableGroup[] | undefined {
  if (!step.groups || step.groups.length === 0) return undefined;

  return step.groups.map((group) => ({
    groupId: group.id,
    name: group.name,
    title: group.title,
    min: group.min,
    max: group.max,
    arrayPath: group.arrayPath,
    zodSchema: buildGroupZodSchema(group, groupFields(step.rows, group.id)),
  }));
}

export function mapFormStep(step: FormStep, names: Map<string, string>): ExportedStep {
  return {
    stepId: step.stepId,
    title: step.title,
    subtitle: step.subtitle || undefined,
    rows: mapRows(step.rows, names),
    groups: mapGroups(step),
  };
}
