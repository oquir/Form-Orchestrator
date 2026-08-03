import { v4 as uuidv4 } from "uuid";
import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type { ApiBinding, CanvasField, FieldCondition, FieldRule } from "../../types/field";
import type { CanvasRow } from "../../types/formStructure";
import type { FieldSpec, TemplateCondition, TemplateRule } from "./baseTemplate.types";

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
        if (field.visibleWhen) {
          const targetId: string | undefined = idsByName.get(field.visibleWhen.fieldId);
          field.visibleWhen = targetId ? { ...field.visibleWhen, fieldId: targetId } : undefined;
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
    });

    colStart += spec.colSpan;
  }

  return { id: uuidv4(), columns: GRID_BASE_COLUMNS, fields, groupId };
}
