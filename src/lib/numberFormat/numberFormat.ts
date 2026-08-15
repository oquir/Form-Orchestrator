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

// Agrupa la parte entera de a tres. Sin `decimals` declarado los decimales solo aparecen si los
// hay -- 1000 se muestra "1.000" y no "1.000,00" -- y con `decimals` se muestran siempre esos, con
// sus ceros: una tarifa de 6 sale "6,0" y la columna queda pareja con la de 7,5.
//
// Rellenar con ceros no puede mentir, porque 6 y 6,0 son el mismo numero. Recortar si podria, y
// por eso el recorte no vive aca sino en applyDecimals, que cambia el valor de verdad.
export function formatNumber(value: number, decimals?: number): string {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= MAX_FORMATTABLE) return String(value);

  // toFixed antes de recortar los ceros es lo que mata la cola de la coma flotante: 0.1 + 0.2
  // llega como 0.30000000000000004 y sale "0,3".
  const fixed: string = Math.abs(value).toFixed(decimals ?? MAX_DISPLAY_DECIMALS);
  const [whole, rest] = fixed.split(".");
  const shown: string = decimals === undefined ? (rest ?? "").replace(/0+$/, "") : (rest ?? "");
  const grouped: string = whole.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
  const body: string = shown.length > 0 ? `${grouped}${DECIMAL_SEPARATOR}${shown}` : grouped;

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
export function sanitizeNumericInput(raw: string, allowNegative = true, decimals?: number): string {
  const negative: boolean = allowNegative && raw.trimStart().startsWith("-");
  const body: string = raw.replace(/[^\d.,]/g, "");

  // Una sola coma. Con dos el texto dejaria de parsear y no habria numero que guardar, asi que se
  // impide escribirlas en vez de descartar el valor despues.
  const first: number = body.indexOf(DECIMAL_SEPARATOR);
  if (first === -1) return negative ? `-${body}` : body;

  const whole: string = body.slice(0, first);
  const rest: string = body
    .slice(first + 1)
    .split(DECIMAL_SEPARATOR)
    .join("");

  // Con decimals en 0 se corta EN la coma, no solo se le saca la coma: pegar "1234,56" tiene que
  // dar 1234 y no 123456, que seria el valor equivocado por dos ordenes de magnitud.
  const single: string =
    decimals === 0
      ? whole
      : `${whole}${DECIMAL_SEPARATOR}${decimals === undefined ? rest : rest.slice(0, decimals)}`;

  return negative ? `-${single}` : single;
}

// Recorta la parte entera a `max` digitos. Es el tope de longitud aplicado al tecleo, y cuenta
// digitos y no caracteres: un "1.234" pegado del portapapeles son cuatro digitos, no cinco, y la
// coma y el menos no son digitos de nadie. La regla y el por que viven en lib/fieldLength; aca
// llega como numero suelto, igual que `allowNegative`, para que este archivo siga siendo de texto.
//
// Solo saca por la derecha, que es lo que hace un maxLength.
export function capIntegerDigits(text: string, max: number | undefined): string {
  if (max === undefined || max < 1) return text;

  const negative: boolean = text.startsWith("-");
  const body: string = negative ? text.slice(1) : text;
  const comma: number = body.indexOf(DECIMAL_SEPARATOR);
  const whole: string = comma === -1 ? body : body.slice(0, comma);

  // Los separadores se guardan aparte y solo entran cuando detras viene un digito: asi el recorte
  // no deja un punto colgando al final. Y si nunca se recorto, sale el texto tal como entro --
  // borrarle el punto a un "1." a medio tipear se lo sacaria de abajo de los dedos.
  let kept = "";
  let pending = "";
  let digits = 0;
  let cut = false;

  for (const char of whole) {
    if (!HAS_DIGIT.test(char)) {
      pending += char;
      continue;
    }
    if (digits === max) {
      cut = true;
      break;
    }
    kept += pending + char;
    pending = "";
    digits += 1;
  }

  if (!cut) return text;

  const rest: string = comma === -1 ? "" : body.slice(comma);

  return `${negative ? "-" : ""}${kept}${rest}`;
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

  return parsed === null ? String(value) : formatNumber(parsed, field.decimals);
}
