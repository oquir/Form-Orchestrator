import { MULTI_VALUE_FIELD_TYPES, OPTION_BASED_FIELD_TYPES } from "../../constants/fieldTypes";
import type { CanvasField, FieldOption, SavedComponent } from "../../types/field";

export function isOptionBasedField(type: string): boolean {
  return OPTION_BASED_FIELD_TYPES.includes(type);
}

export function isMultiValueField(type: string): boolean {
  return MULTI_VALUE_FIELD_TYPES.includes(type);
}

// Un dataSource declara que las opciones las trae un catalogo. Permitir ademas opciones a mano
// dejaria el JSON con dos ordenes contradictorias y el consumidor tendria que adivinar cual gana.
export function allowsManualOptions(field: CanvasField | SavedComponent): boolean {
  return (
    isOptionBasedField(field.type) &&
    field.apiBinding?.kind === "excluded" &&
    field.dataSource === undefined
  );
}

export function exportableOptions(field: CanvasField | SavedComponent): FieldOption[] | undefined {
  return allowsManualOptions(field) ? field.options : undefined;
}
