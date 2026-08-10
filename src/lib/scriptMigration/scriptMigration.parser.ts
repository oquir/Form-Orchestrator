import {
  AGGREGATE_TO_HELPER,
  DIGIT,
  FORMULA_ARITY,
  FORMULA_OPERATORS,
  IDENT_PART,
  IDENT_START,
  WHITESPACE,
} from "./scriptMigration.constants";
import type { Cursor, FormulaArity, FormulaNode, FormulaToken } from "./scriptMigration.types";

// Tokenizer y descenso recursivo del lenguaje de formulas. Estaba en lib/formula, que era la
// implementacion de un lenguaje vivo; ahora es solo el lector del formato muerto, y por eso se
// mudo aca junto al impresor. Del original quedo la mitad: el evaluador se fue entero, porque
// nadie vuelve a calcular una formula, solo a traducirla.
//
// Todo lo de aca lanza; es parseFormula quien atrapa y devuelve null.

function tokenize(source: string): FormulaToken[] {
  const tokens: FormulaToken[] = [];
  let i = 0;

  while (i < source.length) {
    const char: string = source[i];

    if (WHITESPACE.test(char)) {
      i += 1;
      continue;
    }

    if (DIGIT.test(char)) {
      let end = i;
      while (end < source.length && DIGIT.test(source[end])) end += 1;
      if (source[end] === ".") {
        end += 1;
        while (end < source.length && DIGIT.test(source[end])) end += 1;
      }
      tokens.push({ kind: "number", text: source.slice(i, end), pos: i });
      i = end;
      continue;
    }

    if (IDENT_START.test(char)) {
      let end = i;
      while (end < source.length && IDENT_PART.test(source[end])) end += 1;
      tokens.push({ kind: "ident", text: source.slice(i, end), pos: i });
      i = end;
      continue;
    }

    if (FORMULA_OPERATORS.includes(char)) {
      tokens.push({ kind: "op", text: char, pos: i });
      i += 1;
      continue;
    }

    throw new Error(`Carácter no válido "${char}".`);
  }

  return tokens;
}

function peek(cursor: Cursor): FormulaToken | undefined {
  return cursor.tokens[cursor.index];
}

function isOp(token: FormulaToken | undefined, text: string): boolean {
  return token !== undefined && token.kind === "op" && token.text === text;
}

// Un agregado recibia un nombre de campo pelado, no una expresion: leia la columna de un grupo
// repetible. Que sumOf(1 + 2) no compilara era a proposito.
function parseAggregate(cursor: Cursor, callee: string): FormulaNode {
  cursor.index += 1;
  const token: FormulaToken | undefined = peek(cursor);

  if (token?.kind !== "ident") {
    throw new Error(`"${callee}" espera el nombre de un campo de un grupo repetible.`);
  }

  cursor.index += 1;

  if (!isOp(peek(cursor), ")")) throw new Error(`Falta cerrar el paréntesis de "${callee}".`);
  cursor.index += 1;

  return { kind: "aggregate", fn: callee, ref: token.text };
}

function parseCall(cursor: Cursor, callee: string): FormulaNode {
  if (AGGREGATE_TO_HELPER[callee]) return parseAggregate(cursor, callee);

  const arity: FormulaArity | undefined = FORMULA_ARITY[callee];

  if (!arity) throw new Error(`La función "${callee}" no existe.`);

  cursor.index += 1;
  const args: FormulaNode[] = [];

  if (!isOp(peek(cursor), ")")) {
    args.push(parseExpression(cursor));
    while (isOp(peek(cursor), ",")) {
      cursor.index += 1;
      args.push(parseExpression(cursor));
    }
  }

  if (!isOp(peek(cursor), ")")) throw new Error(`Falta cerrar el paréntesis de "${callee}".`);
  cursor.index += 1;

  if (args.length < arity.minArgs || args.length > arity.maxArgs) {
    throw new Error(`"${callee}" recibió ${args.length} argumento(s).`);
  }

  return { kind: "call", callee, args };
}

function parsePrimary(cursor: Cursor): FormulaNode {
  const token: FormulaToken | undefined = peek(cursor);

  if (!token) throw new Error("La fórmula termina de forma inesperada.");

  if (token.kind === "number") {
    cursor.index += 1;
    return { kind: "number", value: Number.parseFloat(token.text) };
  }

  // Un identificador era una llamada solo si le seguia un parentesis; si no, el nombre de un
  // campo. Por eso no habia palabras reservadas: un campo podia llamarse "max" sin chocar.
  if (token.kind === "ident") {
    cursor.index += 1;
    if (isOp(peek(cursor), "(")) return parseCall(cursor, token.text);
    return { kind: "ref", name: token.text };
  }

  if (isOp(token, "(")) {
    cursor.index += 1;
    const inner: FormulaNode = parseExpression(cursor);
    if (!isOp(peek(cursor), ")")) throw new Error("Falta cerrar un paréntesis.");
    cursor.index += 1;
    return inner;
  }

  throw new Error(`No se esperaba "${token.text}".`);
}

function parseUnary(cursor: Cursor): FormulaNode {
  if (isOp(peek(cursor), "-")) {
    cursor.index += 1;
    return { kind: "unary", operator: "-", operand: parseUnary(cursor) };
  }

  if (isOp(peek(cursor), "+")) {
    cursor.index += 1;
    return parseUnary(cursor);
  }

  return parsePrimary(cursor);
}

// La precedencia es la cadena de llamadas: expresion (+ -) baja a termino (* /), que baja a
// unario y a primario. El bucle while, en vez de recursion a la derecha, es lo que da la
// asociatividad por izquierda que el impresor despues da por sentada.
function parseTerm(cursor: Cursor): FormulaNode {
  let left: FormulaNode = parseUnary(cursor);

  while (isOp(peek(cursor), "*") || isOp(peek(cursor), "/")) {
    const operator: string = cursor.tokens[cursor.index].text;
    cursor.index += 1;
    left = { kind: "binary", operator, left, right: parseUnary(cursor) };
  }

  return left;
}

function parseExpression(cursor: Cursor): FormulaNode {
  let left: FormulaNode = parseTerm(cursor);

  while (isOp(peek(cursor), "+") || isOp(peek(cursor), "-")) {
    const operator: string = cursor.tokens[cursor.index].text;
    cursor.index += 1;
    left = { kind: "binary", operator, left, right: parseTerm(cursor) };
  }

  return left;
}

// Nunca lanza: null es "esto no se puede traducir", y quien llama deja el campo como estaba.
export function parseFormula(source: string): FormulaNode | null {
  const trimmed: string = source.trim();
  if (trimmed.length === 0) return null;

  try {
    const cursor: Cursor = { tokens: tokenize(trimmed), index: 0 };
    const ast: FormulaNode = parseExpression(cursor);

    return peek(cursor) ? null : ast;
  } catch {
    return null;
  }
}
