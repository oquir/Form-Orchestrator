import type { DateFormatId } from "../../types/fieldDate";
import { aUtc } from "../maxDates/maxDates";
import {
  ISO_DATE,
  ISO_DATETIME,
  PLACEHOLDER_TOKENS,
  TIME_SUFFIX,
  TOKEN_PATTERN,
} from "./dateFormat.constants";
import type { PatternSlot } from "./dateFormat.types";

// El formato de un campo fecha es de afuera: como la ve quien llena el formulario y como la recibe la
// API. Por dentro el valor es siempre AAAA-MM-DD (o AAAA-MM-DDTHH:mm), que es lo que comparan el
// schema, los limites, las condiciones y los scripts. Convertir en el borde, y solo ahi, es lo que
// deja todo lo demas sin tocar -- la misma idea que el punto de miles de un numero, salvo que esta
// vez el texto formateado si sale: es lo que pide la API.

export function datePattern(format: DateFormatId, withTime: boolean): string {
  return withTime ? `${format}${TIME_SUFFIX}` : format;
}

function patternSlots(pattern: string): PatternSlot[] {
  const slots: PatternSlot[] = [];
  let last: number = 0;

  for (const match of pattern.matchAll(TOKEN_PATTERN)) {
    const index: number = match.index ?? 0;
    if (index > last) slots.push({ kind: "literal", text: pattern.slice(last, index) });
    slots.push({ kind: "token", text: match[0] });
    last = index + match[0].length;
  }

  if (last < pattern.length) slots.push({ kind: "literal", text: pattern.slice(last) });

  return slots;
}

// Lo que se ve mientras se escribe: los digitos en sus lugares y los separadores puestos solos. Un
// separador solo aparece cuando ya hay un digito para despues, asi borrar hacia atras nunca se
// traba en una barra que vuelve a aparecer.
export function maskDateText(text: string, pattern: string): string {
  const digits: string = text.replace(/\D/g, "");
  let masked: string = "";
  let used: number = 0;

  for (const slot of patternSlots(pattern)) {
    if (used >= digits.length) break;

    if (slot.kind === "literal") {
      masked += slot.text;
      continue;
    }

    masked += digits.slice(used, used + slot.text.length);
    used += slot.text.length;
  }

  return masked;
}

// El texto completo pasado al valor interno, o null si falta algo o la fecha no existe (31/02).
export function parseDateText(text: string, pattern: string): string | null {
  const digits: string = text.replace(/\D/g, "");
  const parts: Record<string, string> = {};
  let used: number = 0;

  for (const slot of patternSlots(pattern)) {
    if (slot.kind === "literal") continue;

    parts[slot.text] = digits.slice(used, used + slot.text.length);
    used += slot.text.length;
  }

  if (digits.length !== used) return null;

  const date: string = `${parts.YYYY}-${parts.MM}-${parts.DD}`;
  if (aUtc(date) === null) return null;
  if (parts.HH === undefined) return date;
  if (Number(parts.HH) > 23 || Number(parts.mm) > 59) return null;

  return `${date}T${parts.HH}:${parts.mm}`;
}

// El valor interno escrito en el patron, o null si no es un valor completo. Con hora exige la hora:
// una fecha sola a medio escribir en un campo con hora tiene que seguir viendose como se escribio,
// no completarse con un 00:00 que el usuario no puso.
export function formatIsoValue(value: string, pattern: string, withTime: boolean): string | null {
  const match: RegExpMatchArray | null = value.match(withTime ? ISO_DATETIME : ISO_DATE);
  if (!match) return null;

  const parts: Record<string, string> = {
    YYYY: match[1],
    MM: match[2],
    DD: match[3],
    HH: match[4] ?? "",
    mm: match[5] ?? "",
  };

  return pattern.replace(TOKEN_PATTERN, (token) => parts[token]);
}

// Lo que muestra el input: un valor completo en el patron, y cualquier otra cosa -- un texto a medio
// escribir, una fecha que no existe -- tal cual, para que el usuario vea lo que tecleo.
export function displayDateText(value: unknown, pattern: string, withTime: boolean): string {
  if (typeof value !== "string") return "";

  return formatIsoValue(value, pattern, withTime) ?? value;
}

export function datePlaceholder(pattern: string): string {
  return pattern.replace(TOKEN_PATTERN, (token) => PLACEHOLDER_TOKENS[token]);
}
