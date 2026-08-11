import { NUMERIC_FIELD_TYPES } from "../../constants/fieldTypes";
import { ROUNDING_MULTIPLE } from "./fieldRounding.constants";
import type { RoundableField } from "./fieldRounding.types";

// La aproximacion al millar de un campo numerico. Es aritmetica pura: no sabe cuando se aplica --
// eso lo deciden el blur del simulador y runtimeDerived, que son dos momentos distintos -- solo
// que cuenta como valor redondeable y a que numero va a parar.
//
// El redondeo cambia el valor, no como se muestra: lo que se guarda, lo que leen los demas campos
// y lo que viaja en el payload es el numero ya aproximado.

export function supportsRounding(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type);
}

// Un redondeo apagado, o pegado a un tipo que no lo admite, no deja rastro en el JSON. Cambiarle
// el tipo a un campo que lo tenia prendido no borra la clave del store, y sin esto el consumidor
// recibiria un redondeo declarado sobre un texto.
export function exportableRounding(field: RoundableField): boolean | undefined {
  return field.rounding && supportsRounding(field.type) ? true : undefined;
}

// Math.round rompe el empate siempre hacia +infinito, que con negativos deja de ser simetrico:
// 1500 da 2000 pero -1500 da -1000, y -500 da -0. Se redondea la magnitud y se le devuelve el
// signo, asi un saldo a favor se aproxima igual que uno a cargo.
export function roundToMultiple(value: number, multiple: number): number {
  if (!Number.isFinite(value) || multiple <= 0) return value;

  const rounded: number = Math.round(Math.abs(value) / multiple) * multiple;

  // El + 0 mata el -0. Object.is(-0, 0) es falso, y ese cero raro terminaria en el payload y en
  // cualquier comparacion que lo mire de cerca.
  return (value < 0 ? -rounded : rounded) + 0;
}

// Devuelve el valor intacto cuando no hay nada que redondear. Las guardas no son defensivas: el
// vacio es la que importa, porque sin ella salir de un campo que nadie toco le estampa un 0, y un
// 0 hace pasar el required y viaja al payload como un valor declarado por el contribuyente.
export function applyRounding(field: RoundableField, raw: unknown): unknown {
  if (!field.rounding || !supportsRounding(field.type)) return raw;
  if (raw === undefined || raw === null) return raw;
  if (typeof raw === "string" && raw.trim() === "") return raw;

  const parsed: number = Number(raw);
  if (!Number.isFinite(parsed)) return raw;

  return roundToMultiple(parsed, ROUNDING_MULTIPLE);
}
