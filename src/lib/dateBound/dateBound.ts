import type { DateBound, DateBoundSide, DateBoundUnit } from "../../types/fieldDate";
import { FIXED_DATE_PATTERN, UNIT_NAMES } from "./dateBound.constants";

// Los limites de un campo fecha, traducidos al texto que viaja dentro del schema de Zod. Un limite
// relativo no se resuelve al exportar sino cada vez que corre el schema: "no puede ser futura"
// exportado hoy tiene que seguir siendo verdad dentro de un ano, y el consumidor no tiene otro
// camino de validacion que el schema. Por eso lo que sale de aca es codigo, no una fecha.
//
// Ojo: ese codigo lee el reloj de quien llena el formulario, tambien en el simulador. Los helpers de
// mora usan context.hoy; un schema no tiene contexto, solo el valor.

// Un limite a medio escribir (una fecha fija vacia, un "hace 0 anos") no viaja: el schema sigue
// como si no existiera hasta que se termine de escribir.
export function isCompleteBound(bound: DateBound | undefined): bound is DateBound {
  if (!bound) return false;
  if (bound.kind === "fixed") return FIXED_DATE_PATTERN.test(bound.date);
  if (bound.kind === "relative") return Number.isInteger(bound.amount) && bound.amount > 0;

  return true;
}

// La hora local y no la UTC: es la fecha del calendario de quien llena el formulario, igual que lo
// que escribe en el input. Con UTC, en Colombia "hoy" pasaria a ser manana desde las 7 de la noche.
const TODAY_TEXT: string =
  '[String(d.getFullYear()).padStart(4, "0"), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-")';

// Al mover meses se pasa primero al dia 1: el 31 de marzo menos un mes seria el 31 de febrero, que
// JavaScript corre al 3 de marzo. Despues se vuelve al dia original o al ultimo del mes, el menor.
function shiftCode(unit: DateBoundUnit, offset: number): string {
  if (unit === "days") return `d.setDate(d.getDate() + ${offset}); `;

  const months: number = unit === "years" ? offset * 12 : offset;

  return `const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + ${months}); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); `;
}

// La expresion JavaScript que da el limite como AAAA-MM-DD.
export function boundExpression(bound: DateBound): string {
  if (bound.kind === "fixed") return JSON.stringify(bound.date);

  const shift: string =
    bound.kind === "relative"
      ? shiftCode(bound.unit, bound.direction === "past" ? -bound.amount : bound.amount)
      : "";

  return `((d) => { ${shift}return ${TODAY_TEXT}; })(new Date())`;
}

function formatFixedDate(date: string): string {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

function span(amount: number, unit: DateBoundUnit): string {
  const [singular, plural] = UNIT_NAMES[unit];

  return `${amount} ${amount === 1 ? singular : plural}`;
}

// El mensaje no puede llevar la fecha que resulto de un limite relativo: el schema es texto fijo y la
// fecha cambia cada dia. Se dice la regla en vez del resultado.
export function boundMessage(bound: DateBound, side: DateBoundSide, subject: string): string {
  switch (bound.kind) {
    case "today":
      return `${subject} no puede ser ${side === "min" ? "anterior" : "posterior"} a hoy`;
    case "fixed":
      return `${subject} no puede ser ${side === "min" ? "anterior" : "posterior"} al ${formatFixedDate(bound.date)}`;
    case "relative": {
      const tense: string = bound.direction === "past" ? "en el pasado" : "en el futuro";
      // Hacia atras, el minimo es el tope lejano ("no mas de 120 anos atras") y el maximo el cercano
      // ("al menos 18 anos atras"). Hacia adelante es al reves.
      const isFarLimit: boolean = (bound.direction === "past") === (side === "min");

      return isFarLimit
        ? `${subject} no puede estar a más de ${span(bound.amount, bound.unit)} ${tense}`
        : `${subject} tiene que estar al menos ${span(bound.amount, bound.unit)} ${tense}`;
    }
  }
}
