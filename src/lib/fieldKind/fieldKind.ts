import { PRESENTATIONAL_FIELD_TYPES } from "../../constants/fieldTypes";
import type { CanvasField } from "../../types/field";

export function isPresentationalField(type: string): boolean {
  return PRESENTATIONAL_FIELD_TYPES.includes(type);
}

export function isInputField(type: string): boolean {
  return !isPresentationalField(type);
}

export function findLabelFor(fields: CanvasField[], fieldId: string): CanvasField | null {
  return fields.find((field) => field.labelFor === fieldId) ?? null;
}

export function hasLinkedLabel(fields: CanvasField[], fieldId: string): boolean {
  return findLabelFor(fields, fieldId) !== null;
}

export function labelTargetCandidates(fields: CanvasField[], labelId: string): CanvasField[] {
  const current: string | undefined = fields.find((field) => field.id === labelId)?.labelFor;

  return fields.filter((field) => {
    if (!isInputField(field.type)) return false;
    if (field.id === current) return true;

    return !hasLinkedLabel(fields, field.id);
  });
}
