import type {
  ExportedCondition,
  ExportedRepeatableGroup,
  ExportedRow,
  ExportedRule,
  ExportedStep,
} from "../../types/exportForm";
import type { CanvasField, FieldCondition, FieldDataSource } from "../../types/field";
import type { CanvasRow, FormStep } from "../../types/formStructure";
import { operatorTakesList, parseConditionList } from "../fieldCondition/fieldCondition";
import { isPresentationalField } from "../fieldKind/fieldKind";
import { exportableOptions } from "../fieldOptions/fieldOptions";
import { exportableTooltip } from "../fieldTooltip/fieldTooltip";
import { groupFields } from "../repeatableGroup/repeatableGroup";
import { buildGroupZodSchema, buildZodSchema } from "../zodSchema/zodSchema";

// Traduccion del modelo interno al contrato de salida. La regla que gobierna todo el archivo:
// hacia afuera no viaja ningun uuid, cada referencia a un campo se convierte en su nombre.

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

  // Los operadores de lista guardan el valor como texto separado por comas mientras se edita;
  // al salir se entrega ya partido en array para que el consumidor no tenga que interpretarlo.
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

export function resolveDataSource(
  field: CanvasField,
  names: Map<string, string>,
): FieldDataSource | undefined {
  const source: FieldDataSource | undefined = field.dataSource;
  if (!source) return undefined;

  return {
    catalog: source.catalog,
    dependsOn: source.dependsOn ? (names.get(source.dependsOn) ?? source.dependsOn) : undefined,
  };
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
      // Solo se exporta el schema como texto, nunca las validaciones sueltas: que no haya schema
      // es justamente como el consumidor sabe que un campo presentacional no valida nada.
      validations: isPresentationalField(field.type) ? {} : { zodSchema: buildZodSchema(field) },
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
      dataSource: resolveDataSource(field, names),
      labelFor: field.labelFor ? (names.get(field.labelFor) ?? field.labelFor) : undefined,
      content: field.content,
      tooltip: exportableTooltip(field),
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
