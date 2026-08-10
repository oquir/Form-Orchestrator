// Precedencia de los operadores del lenguaje viejo, para decidir cuando hacen falta parentesis
// al imprimir. Los cuatro son asociativos a izquierda, igual que en JS.
export const PRECEDENCE: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

export const UNARY_PRECEDENCE: number = 3;

// Los agregados se vuelven helpers normales porque en el script la columna de un grupo llega como
// array de verdad: sumOf(x) era sintaxis especial, sum({x}) es una llamada con un array adentro.
export const AGGREGATE_TO_HELPER: Record<string, string> = { sumOf: "sum", countOf: "count" };
