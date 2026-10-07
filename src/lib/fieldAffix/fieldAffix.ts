import { NUMERIC_FIELD_TYPES } from "../../constants/fieldTypes";
import type { AffixSide } from "../../types/fieldAffix";
import type { AffixableField } from "./fieldAffix.types";

// Prefijo y sufijo de un campo numerico: el $ de un renglon de plata, el X1000 de una tarifa, los
// kW del renglon 18. Son presentacion pura, igual que `formatted`, y por la misma razon nunca se
// pegan al valor: un "$ 1.000" en el estado viajaria al payload como texto y los scripts lo leerian
// como NaN. Viven al lado del input, no adentro de su texto.

export function supportsAffixes(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type);
}

// Lo que se dibuja y lo que se exporta, que es lo mismo. El store guarda lo tecleado tal cual --
// recortar en cada tecla se comeria el espacio de "X 1000" antes de escribir el 1 -- y aca se
// recorta. Un afijo pegado a un tipo que no lo admite tampoco sale: cambiarle el tipo a un campo
// no borra la clave del store.
export function affixOf(field: AffixableField, side: AffixSide): string | undefined {
  if (!supportsAffixes(field.type)) return undefined;

  const text: string | undefined = field[side]?.trim();

  return text ? text : undefined;
}
