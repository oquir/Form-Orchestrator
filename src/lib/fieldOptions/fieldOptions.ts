import {
  INLINE_CAPABLE_FIELD_TYPES,
  MULTI_VALUE_FIELD_TYPES,
  OPTION_BASED_FIELD_TYPES,
} from "../../constants/fieldTypes";
import type { CanvasField, FieldOption, SavedComponent } from "../../types/field";
import type { InlineCapableField } from "./fieldOptions.types";

// Quien pone las opciones de un select. Solo un campo excluido del payload las lleva escritas a
// mano; uno mapeado -o uno sin decidir todavia- las recibe del consumidor, que consulta el
// catalogo por su apiBinding.path. Salir del estado excluido descarta las opciones a proposito.

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

// Si las opciones van en una sola linea. Ausente es como siempre -- una debajo de otra --, asi que
// ningun borrador ya guardado cambia de aspecto al aparecer la propiedad.
//
// Es solo presentacion: no toca el valor, ni el schema, ni cuantas opciones se pueden elegir. Un
// radio_group elige una sola por construccion, en linea o en columna.
export function supportsInlineOptions(type: string): boolean {
  return INLINE_CAPABLE_FIELD_TYPES.includes(type);
}

export function showsOptionsInline(field: InlineCapableField): boolean {
  return Boolean(field.inlineOptions) && supportsInlineOptions(field.type);
}

export function exportableInlineOptions(field: InlineCapableField): true | undefined {
  return showsOptionsInline(field) ? true : undefined;
}
