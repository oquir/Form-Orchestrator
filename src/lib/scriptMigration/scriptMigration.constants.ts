import type { FormulaArity } from "./scriptMigration.types";

// El alfabeto del lenguaje viejo. IDENT_START deja fuera los digitos, asi que un nombre de campo
// no puede empezar por numero: es lo que permite decidir si un token es cifra o identificador
// mirando solo el primer caracter.
export const DIGIT = /[0-9]/;
export const IDENT_START = /[A-Za-z_]/;
export const IDENT_PART = /[A-Za-z0-9_]/;
export const WHITESPACE = /\s/;

export const FORMULA_OPERATORS: string[] = ["+", "-", "*", "/", "(", ")", ","];

// Solo la aridad: el parser la necesita para rechazar una llamada mal escrita, pero nadie vuelve a
// evaluar estas funciones. Sus implementaciones viven ahora en SCRIPT_HELPERS.
export const FORMULA_ARITY: Record<string, FormulaArity> = {
  abs: { minArgs: 1, maxArgs: 1 },
  min: { minArgs: 1, maxArgs: Number.POSITIVE_INFINITY },
  max: { minArgs: 1, maxArgs: Number.POSITIVE_INFINITY },
  sum: { minArgs: 1, maxArgs: Number.POSITIVE_INFINITY },
  round: { minArgs: 1, maxArgs: 2 },
  floor: { minArgs: 1, maxArgs: 1 },
  ceil: { minArgs: 1, maxArgs: 1 },
  dvNit: { minArgs: 1, maxArgs: 1 },
};

// Precedencia de los operadores del lenguaje viejo, para decidir cuando hacen falta parentesis
// al imprimir. Los cuatro son asociativos a izquierda, igual que en JS.
export const PRECEDENCE: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

export const UNARY_PRECEDENCE: number = 3;

// Los agregados se vuelven helpers normales porque en el script la columna de un grupo llega como
// array de verdad: sumOf(x) era sintaxis especial, sum({x}) es una llamada con un array adentro.
export const AGGREGATE_TO_HELPER: Record<string, string> = { sumOf: "sum", countOf: "count" };
