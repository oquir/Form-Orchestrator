import type { CalcSign } from "../../types/simpleCalc";
import {
  NAME_PATTERN,
  NUMBER_PATTERN,
  REF_PADDING_PATTERN,
  WHITESPACE_PATTERN,
} from "./simpleCalc.constants";
import type { CalcShape } from "./simpleCalc.types";

// Lee de izquierda a derecha la forma que escribe buildSimpleCalcScript, saltando los espacios
// entre piezas. Es permisivo en los detalles (parentesis, sum, el punto y coma) porque quien decide
// si el texto es de verdad del modal es la comparacion con lo regenerado; aca solo se corta en el
// primer caracter que no encaja.
export function readCalcShape(source: string): CalcShape | null {
  let position: number = 0;

  function skip(pattern: RegExp): void {
    position += pattern.exec(source.slice(position))?.[0].length ?? 0;
  }

  function read(pattern: RegExp): string | null {
    const match: RegExpExecArray | null = pattern.exec(source.slice(position));
    if (match === null) return null;

    position += match[0].length;
    return match[0];
  }

  function eat(token: string): boolean {
    skip(WHITESPACE_PATTERN);
    if (!source.startsWith(token, position)) return false;

    position += token.length;
    return true;
  }

  // Dentro de {{ }} rige lo mismo que en REF_PATTERN: espacios y tabs si, saltos de linea no.
  function readTerm(): string | null {
    const summed: boolean = eat("sum(");
    if (!eat("{{")) return null;

    skip(REF_PADDING_PATTERN);
    const name: string | null = read(NAME_PATTERN);
    skip(REF_PADDING_PATTERN);
    if (name === null || !source.startsWith("}}", position)) return null;

    position += 2;
    if (summed && !eat(")")) return null;
    return name;
  }

  if (!eat("return")) return null;

  const floorAtZero: boolean = eat("max(");
  const grouped: boolean = eat("(");
  const terms: CalcShape["terms"] = [];
  let sign: CalcSign = eat("-") ? "-" : "+";
  let hasMore: boolean = true;

  while (hasMore) {
    const name: string | null = readTerm();
    if (name === null) return null;

    terms.push({ sign, name });

    const next: CalcSign | null = eat("+") ? "+" : eat("-") ? "-" : null;
    if (next === null) hasMore = false;
    else sign = next;
  }

  if (grouped && !eat(")")) return null;

  let multiplier: number | null = null;

  if (eat("*")) {
    skip(WHITESPACE_PATTERN);
    const text: string | null = read(NUMBER_PATTERN);
    const value: number = text === null ? Number.NaN : Number(text);
    if (!Number.isFinite(value)) return null;

    multiplier = value;
  }

  if (floorAtZero && !(eat(",") && eat("0") && eat(")"))) return null;

  eat(";");
  skip(WHITESPACE_PATTERN);

  return position === source.length ? { terms, floorAtZero, multiplier } : null;
}
