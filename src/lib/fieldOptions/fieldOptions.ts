import { MULTI_VALUE_FIELD_TYPES, OPTION_BASED_FIELD_TYPES } from "../../constants/fieldTypes";
import type { CanvasField, FieldOption, SavedComponent } from "../../types/field";

export function isOptionBasedField(type: string): boolean {
  return OPTION_BASED_FIELD_TYPES.includes(type);
}

export function isMultiValueField(type: string): boolean {
  return MULTI_VALUE_FIELD_TYPES.includes(type);
}

export function allowsManualOptions(field: CanvasField | SavedComponent): boolean {
  return isOptionBasedField(field.type) && field.apiBinding?.kind === "excluded";
}

export function exportableOptions(field: CanvasField | SavedComponent): FieldOption[] | undefined {
  return allowsManualOptions(field) ? field.options : undefined;
}
