import { MULTI_VALUE_FIELD_TYPES, OPTION_BASED_FIELD_TYPES } from "../../constants/fieldTypes";
import type { CanvasField, FieldOption, SavedComponent } from "../../types/field";

// Quien pone las opciones de un select. Solo un campo excluido del payload las lleva escritas a
// mano; uno mapeado -o uno sin decidir todavia- las recibe del consumidor, que consulta el
// catalogo por su apiBinding.path. Salir del estado excluido descarta las opciones a proposito.

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
