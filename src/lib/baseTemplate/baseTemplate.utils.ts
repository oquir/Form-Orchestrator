import { v4 as uuidv4 } from "uuid";
import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type { ApiBinding, CanvasField } from "../../types/field";
import type { CanvasRow } from "../../types/formStructure";
import type { FieldSpec } from "./baseTemplate.types";

export function bindingFor(spec: FieldSpec): ApiBinding | undefined {
  if (spec.path !== undefined) return { kind: "mapped", path: spec.path };
  if (spec.excluded) return { kind: "excluded" };

  return undefined;
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
      logic: { dependencies: [], typeScript: "", formula: spec.formula },
      alwaysDisabled: spec.alwaysDisabled,
      apiBinding: bindingFor(spec),
    });

    colStart += spec.colSpan;
  }

  return { id: uuidv4(), columns: GRID_BASE_COLUMNS, fields, groupId };
}
