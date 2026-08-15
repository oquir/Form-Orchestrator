import { LENGTH_CAPABLE_FIELD_TYPES, NUMERIC_FIELD_TYPES } from "../../constants/fieldTypes";
import type { AuthoredLengthField, LengthLimitedField } from "./fieldLength.types";

// Cuanto se puede escribir en un campo. Una sola declaracion del autor -- validations.maxLength --
// leida de dos maneras segun el tipo:
//
//   texto:  caracteres, tal cual, como el maxLength nativo del HTML.
//   numero: digitos de la PARTE ENTERA, no caracteres del texto que se ve.
//
// Lo segundo es asi porque el texto de un numero no es estable. Los puntos de miles aparecen y
// desaparecen con `formatted`, el menos lo gobierna allowsNegative y los decimales los gobierna
// `decimals`: contando caracteres, prender el formato le comeria digitos al tope y un campo de 9
// pasaria a aceptar 7. Contando digitos enteros, cada propiedad manda sobre su pedazo del numero.
//
// Y a diferencia del redondeo o del recorte de signo, esto NO cambia el valor. Se impide teclear de
// mas y el schema rechaza lo que entre por cualquier otro camino; recortarle digitos a un numero ya
// escrito lo correria de orden de magnitud, que es justo lo que un tope esta para evitar.

export function supportsMaxLength(type: string): boolean {
  return LENGTH_CAPABLE_FIELD_TYPES.includes(type);
}

export function countsDigits(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type);
}

// Un tope de cero no es una regla sino un numero a medio escribir en el panel: en un texto dejaria
// el campo intocable y en un numero no lo cumpliria ningun valor, ni siquiera el 0. Se lee como
// ausente, y pasan por aca tanto el schema como el input para que no puedan discrepar.
export function effectiveMaxLength(declared: number | undefined): number | undefined {
  return declared !== undefined && declared > 0 ? declared : undefined;
}

// Lo que el input tiene que aplicar, leido del campo ya exportado.
export function maxLengthOf(field: LengthLimitedField): number | undefined {
  return supportsMaxLength(field.type) ? effectiveMaxLength(field.maxLength) : undefined;
}

// Sale ademas del schema, no en lugar del. El schema es la regla -- es lo unico con lo que el
// consumidor puede validar -- y esta clave es lo que le deja ademas frenar el tecleo antes de que
// el valor exista. Salen las dos del mismo lugar del modelo, asi que no hay dos verdades.
//
// Limite conocido: un override condicional puede cambiar maxLength y esta clave siempre lleva el de
// base. Es a proposito -- se elige la lectura mas floja, para que el teclado nunca rechace algo que
// seria legal; lo que el override apriete lo caza el schema, que es quien manda.
export function exportableMaxLength(field: AuthoredLengthField): number | undefined {
  return supportsMaxLength(field.type)
    ? effectiveMaxLength(field.validations.maxLength)
    : undefined;
}
