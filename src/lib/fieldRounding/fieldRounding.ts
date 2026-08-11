import { NUMERIC_FIELD_TYPES } from "../../constants/fieldTypes";
import { ROUNDING_MULTIPLE } from "./fieldRounding.constants";
import type { RoundableField } from "./fieldRounding.types";

// Los dos redondeos de un campo numerico: al millar y a N decimales. Es aritmetica pura -- cuando
// se aplican lo deciden el blur del simulador y runtimeDerived, que son dos momentos distintos --
// y los dos cambian el valor, no como se muestra: lo que se guarda, lo que leen los demas campos y
// lo que viaja en el payload es el numero ya aproximado.
//
// El recorte de decimales vive aca y no en numberFormat justamente por eso. Rellenar con ceros al
// mostrar (6 -> "6,0") es maquillaje y no puede mentir; recortar 1234,56 a 1235 mostrandolo pero
// guardando 1234,56 dejaria la pantalla y el payload diciendo cosas distintas.

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

// Escala, redondea y desescala, con el mismo tratamiento de magnitud y signo que roundToMultiple.
//
// Se eligio sobre Number(value.toFixed(n)), que era la otra opcion evidente. Los dos son simetricos
// con negativos; difieren en que toFixed sigue la cola binaria del double y este sigue lo que se
// imprime. Un 0.35 se guarda como 0.34999999999999997, asi que toFixed(1) da 0,3 -- correcto sobre
// el valor real y un error a la vista de cualquiera que lea "0,35" en la pantalla. Medido: de 17
// casos difieren en tres, y en los tres gana el que coincide con lo que se ve.
//
// Ninguno de los dos es exacto, porque no puede serlo: 1.005 con dos decimales da 1 en ambos, ya
// que el double guardado es 1.00499999999999989.
export function roundToDecimals(value: number, decimals: number): number {
  if (!Number.isFinite(value) || decimals < 0) return value;

  const factor: number = 10 ** decimals;
  const magnitude: number = Math.abs(value) * factor;
  // Arriba del entero seguro la multiplicacion ya perdio precision, y redondear decimales sobre un
  // numero que no tiene tantos digitos exactos no significa nada. Se devuelve intacto.
  if (magnitude > Number.MAX_SAFE_INTEGER) return value;

  const rounded: number = Math.round(magnitude) / factor;

  return (value < 0 ? -rounded : rounded) + 0;
}

// El numero legible que hay detras de lo que llega, o null si no hay ninguno. La guarda del vacio
// no es defensiva: sin ella salir de un campo que nadie toco le estampa un 0, y un 0 hace pasar el
// required y viaja al payload como un valor declarado por el contribuyente.
function toFiniteNumber(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === "string" && raw.trim() === "") return null;

  const parsed: number = Number(raw);

  return Number.isFinite(parsed) ? parsed : null;
}

export function applyRounding(field: RoundableField, raw: unknown): unknown {
  if (!field.rounding || !supportsRounding(field.type)) return raw;

  const parsed: number | null = toFiniteNumber(raw);

  return parsed === null ? raw : roundToMultiple(parsed, ROUNDING_MULTIPLE);
}

export function applyDecimals(field: RoundableField, raw: unknown): unknown {
  if (field.decimals === undefined || !supportsRounding(field.type)) return raw;

  const parsed: number | null = toFiniteNumber(raw);

  return parsed === null ? raw : roundToDecimals(parsed, field.decimals);
}

export function exportableDecimals(field: RoundableField): number | undefined {
  return field.decimals !== undefined && supportsRounding(field.type) ? field.decimals : undefined;
}
