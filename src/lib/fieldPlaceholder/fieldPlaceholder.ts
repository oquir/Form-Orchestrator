import { PLACEHOLDER_CAPABLE_FIELD_TYPES } from "../../constants/fieldTypes";
import type { PlaceholderField } from "./fieldPlaceholder.types";

// El texto gris que muestra un campo vacio. Es presentacion pura: nunca entra en el valor, asi que
// no lo ve el schema, ni un script, ni el payload. Un campo que lo deja vacio no "vale" su
// placeholder, y un obligatorio sigue fallando aunque se vea algo escrito.
//
// Solo en los que tienen una caja vacia donde ponerlo. La fecha queda afuera porque su caja ya
// muestra el formato (dd/mm/aaaa), que es la pista que de verdad hace falta ahi.

export function supportsPlaceholder(type: string): boolean {
  return PLACEHOLDER_CAPABLE_FIELD_TYPES.includes(type);
}

// Lo que se dibuja y lo que se exporta, que es lo mismo. El store guarda lo tecleado tal cual --
// recortar en cada tecla se comeria el espacio antes de escribir la palabra siguiente -- y aca se
// recorta. Cambiarle el tipo a un campo no borra la clave, asi que un tipo sin placeholder la ignora.
export function placeholderOf(field: PlaceholderField): string | undefined {
  if (!supportsPlaceholder(field.type)) return undefined;

  const text: string | undefined = field.placeholder?.trim();

  return text ? text : undefined;
}
