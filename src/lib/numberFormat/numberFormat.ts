import { NUMERIC_FIELD_TYPES } from "../../constants/fieldTypes";
import {
  DECIMAL_SEPARATOR,
  GROUP_SEPARATOR,
  MAX_DISPLAY_DECIMALS,
  MAX_FORMATTABLE,
} from "./numberFormat.constants";
import type { FormattableField } from "./numberFormat.types";

// Como se ve un numero en pantalla y como vuelve a entrar cuando lo editan. La regla que gobierna
// todo el archivo, y de la que depende que el resto del simulador no se entere de que esto existe:
//
//   EL TEXTO FORMATEADO NO SALE DEL INPUT. El estado guarda un numero de verdad.
//
// No es una preferencia de estilo. buildPayload mete el valor del estado en el JSON sin parsearlo
// y toScriptNumber lo lee con parseFloat, y parseFloat("1.000") es 1: un "1.000" filtrado al
// estado seria un error de tres ordenes de magnitud, en silencio, en una declaracion de impuestos.
//
// El formateador esta escrito a mano en vez de con Intl.NumberFormat porque tiene que hacer ida y
// vuelta exacto con parseFormattedNumber, e Intl puede emitir caracteres que el parser no espera
// -- varios locales usan U+00A0 como separador de miles.

const ALLOWED_TEXT: RegExp = /^-?[\d.]*,?\d*$/;

const HAS_DIGIT: RegExp = /\d/;

export function supportsFormatting(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type);
}

export function exportableFormatting(field: FormattableField): boolean | undefined {
  return field.formatted && supportsFormatting(field.type) ? true : undefined;
}

// Agrupa la parte entera de a tres. Los decimales solo aparecen si los hay: 1000 se muestra
// "1.000" y no "1.000,00", que es lo que se espera de un renglon de la declaracion.
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= MAX_FORMATTABLE) return String(value);

  // toFixed antes de recortar los ceros es lo que mata la cola de la coma flotante: 0.1 + 0.2
  // llega como 0.30000000000000004 y sale "0,3".
  const fixed: string = Math.abs(value).toFixed(MAX_DISPLAY_DECIMALS);
  const [whole, decimals] = fixed.split(".");
  const trimmed: string = decimals.replace(/0+$/, "");
  const grouped: string = whole.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
  const body: string = trimmed.length > 0 ? `${grouped}${DECIMAL_SEPARATOR}${trimmed}` : grouped;

  // value < 0 es falso para -0, asi que el cero negativo sale "0" y no "-0".
  return value < 0 ? `-${body}` : body;
}

// El punto es SIEMPRE separador de miles y la coma SIEMPRE el decimal, que es la lectura de la
// localizacion del formulario: por eso "1.000" son mil y no uno. La contra conocida es que quien
// tipee "1.5" con la costumbre inglesa obtiene 15; es ambiguo de verdad y se eligio el lado que
// le sirve a quien llena una declaracion colombiana.
//
// Devuelve null cuando el texto no es un numero. Que hacer con eso lo decide el input, que lo
// trata como campo vacio: es lo mismo que hacia el type="number" nativo con un valor invalido.
export function parseFormattedNumber(text: string): number | null {
  const trimmed: string = text.trim();
  if (trimmed.length === 0) return null;

  // Digitos, puntos de miles y a lo sumo una coma decimal, y al menos un digito. La guarda va aca
  // y no solo en el filtro de tipeo porque esta es la funcion que decide que se vuelve numero:
  // sin ella Number() leeria "1e5" como cien mil, y la garantia dependeria de que alguien se
  // haya acordado de llamar antes a sanitizeNumericInput.
  if (!ALLOWED_TEXT.test(trimmed) || !HAS_DIGIT.test(trimmed)) return null;

  const normalized: string = trimmed
    .split(GROUP_SEPARATOR)
    .join("")
    .replace(DECIMAL_SEPARATOR, ".");
  const parsed: number = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

// Lo que se puede tipear. Al pasar de type="number" a type="text" se pierde el rechazo nativo,
// asi que la lista blanca se escribe aca -- y termina siendo mas estricta que la del navegador,
// que aceptaba "1e5" como numero valido de punto flotante.
//
// `allowNegative` llega como booleano y no como el campo entero para que este archivo siga siendo
// solo sobre texto: quien decide la politica de signo es lib/fieldSign. Cuando es falso el menos
// se descarta como cualquier otro caracter, asi que tampoco entra pegando desde el portapapeles.
export function sanitizeNumericInput(raw: string, allowNegative = true): string {
  const negative: boolean = allowNegative && raw.trimStart().startsWith("-");
  const body: string = raw.replace(/[^\d.,]/g, "");

  // Una sola coma. Con dos el texto dejaria de parsear y no habria numero que guardar, asi que se
  // impide escribirlas en vez de descartar el valor despues.
  const first: number = body.indexOf(DECIMAL_SEPARATOR);
  const single: string =
    first === -1
      ? body
      : body.slice(0, first + 1) +
        body
          .slice(first + 1)
          .split(DECIMAL_SEPARATOR)
          .join("");

  return negative ? `-${single}` : single;
}

// El texto mientras el campo esta enfocado: sin agrupar, para poder editarlo, pero con coma
// decimal. La coma no es opcional aca -- el parser lee el punto como separador de miles, asi que
// mostrar "1.5" y volver a leerlo daria 15.
export function toEditableText(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value).replace(".", DECIMAL_SEPARATOR) : "";
  }

  return String(value);
}

// El texto en reposo. Un campo sin `formatted` tambien pasa por aca: no se agrupa, pero igual se
// muestra con coma decimal, porque el parser es el mismo para los dos.
export function formatForDisplay(field: FormattableField, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (!field.formatted || !supportsFormatting(field.type)) return toEditableText(value);

  const parsed: number | null =
    typeof value === "number" ? value : parseFormattedNumber(String(value));

  return parsed === null ? String(value) : formatNumber(parsed);
}
