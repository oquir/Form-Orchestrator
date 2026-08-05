import { v4 as uuidv4 } from "uuid";
import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type {
  ApiBinding,
  CanvasField,
  FieldCondition,
  FieldRule,
  FieldValidationOverride,
} from "../../types/field";
import type { CanvasRow } from "../../types/formStructure";
import type {
  FieldSpec,
  TemplateCondition,
  TemplateRule,
  TemplateValidationOverride,
} from "./baseTemplate.types";

export function bindingFor(spec: FieldSpec): ApiBinding | undefined {
  if (spec.path !== undefined) return { kind: "mapped", path: spec.path };
  if (spec.excluded) return { kind: "excluded" };

  return undefined;
}

function pendingCondition(condition: TemplateCondition | undefined): FieldCondition | undefined {
  if (!condition) return undefined;

  return { fieldId: condition.field, operator: condition.operator, value: condition.value };
}

function pendingRules(rules: TemplateRule[] | undefined): FieldRule[] | undefined {
  if (!rules || rules.length === 0) return undefined;

  return rules.map((rule) => ({
    id: uuidv4(),
    label: rule.label,
    matchAll: true,
    when: rule.when.map((condition) => ({
      id: uuidv4(),
      fieldId: condition.field,
      operator: condition.operator,
      value: condition.value,
    })),
    effects: [{ id: uuidv4(), kind: "formula" as const, expression: rule.formula }],
  }));
}

function pendingOverrides(
  overrides: TemplateValidationOverride[] | undefined,
): FieldValidationOverride[] | undefined {
  if (!overrides || overrides.length === 0) return undefined;

  return overrides.map((override) => ({
    id: uuidv4(),
    when: {
      fieldId: override.when.field,
      operator: override.when.operator,
      value: override.when.value,
    },
    validations: override.validations,
  }));
}

function resolvePointer(
  condition: FieldCondition | undefined,
  idsByName: Map<string, string>,
): FieldCondition | undefined {
  if (!condition) return undefined;

  const targetId: string | undefined = idsByName.get(condition.fieldId);

  return targetId ? { ...condition, fieldId: targetId } : undefined;
}

// La plantilla apunta al campo observado por nombre; los uuid solo existen despues de buildRow.
export function resolveTemplateConditions<T extends { rows: CanvasRow[] }>(steps: T[]): T[] {
  const idsByName: Map<string, string> = new Map();

  for (const step of steps) {
    for (const row of step.rows) {
      for (const field of row.fields) idsByName.set(field.name, field.id);
    }
  }

  for (const step of steps) {
    for (const row of step.rows) {
      for (const field of row.fields) {
        field.visibleWhen = resolvePointer(field.visibleWhen, idsByName);
        field.enableWhen = resolvePointer(field.enableWhen, idsByName);

        if (field.dataSource?.dependsOn) {
          const parentId: string | undefined = idsByName.get(field.dataSource.dependsOn);
          field.dataSource = parentId
            ? { ...field.dataSource, dependsOn: parentId }
            : { catalog: field.dataSource.catalog };
        }

        if (field.validations.overrides) {
          field.validations.overrides = field.validations.overrides.flatMap((override) => {
            const targetId: string | undefined = idsByName.get(override.when.fieldId);
            return targetId ? [{ ...override, when: { ...override.when, fieldId: targetId } }] : [];
          });
        }

        if (field.logic.rules) {
          field.logic.rules = field.logic.rules.map((rule) => ({
            ...rule,
            when: rule.when.flatMap((condition) => {
              const targetId: string | undefined = idsByName.get(condition.fieldId);
              return targetId ? [{ ...condition, fieldId: targetId }] : [];
            }),
          }));
        }
      }
    }
  }

  return steps;
}

export function buildRow(specs: FieldSpec[], groupId?: string): CanvasRow {
  const fields: CanvasField[] = [];
  let colStart = 1;

  for (const spec of specs) {
    fields.push({
      id: uuidv4(),
      name: spec.name,
      type: spec.type,
      label: spec.label,
      colStart,
      colSpan: spec.colSpan,
      validations: {
        ...(spec.required ? { required: true } : {}),
        ...(spec.min === undefined ? {} : { min: spec.min }),
        ...(spec.pattern === undefined ? {} : { pattern: spec.pattern }),
        ...(spec.message === undefined ? {} : { message: spec.message }),
        ...(spec.validationOverrides === undefined
          ? {}
          : { overrides: pendingOverrides(spec.validationOverrides) }),
      },
      styles: {},
      logic: {
        dependencies: [],
        typeScript: "",
        formula: spec.formula,
        rules: pendingRules(spec.rules),
      },
      alwaysDisabled: spec.alwaysDisabled,
      apiBinding: bindingFor(spec),
      visibleWhen: pendingCondition(spec.visibleWhen),
      enableWhen: pendingCondition(spec.enableWhen),
      dataSource: spec.dataSource,
    });

    colStart += spec.colSpan;
  }

  return { id: uuidv4(), columns: GRID_BASE_COLUMNS, fields, groupId };
}
