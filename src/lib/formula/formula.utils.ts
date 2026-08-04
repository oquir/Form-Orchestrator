import { FORMULA_AGGREGATES, FORMULA_FUNCTIONS } from "../../constants/formula";
import type { Cursor, FormulaFunction, FormulaNode, FormulaToken } from "../../types/formula";
import { DIGIT, FORMULA_OPERATORS, IDENT_PART, IDENT_START, WHITESPACE } from "./formula.constants";

// Tokenizer y descenso recursivo. A diferencia de parseFormula, todo lo de aca SI lanza:
// es parseFormula quien atrapa y convierte el error en un mensaje para el editor.

export function tokenize(source: string): FormulaToken[] {
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

    throw new Error(`Carácter no válido "${char}" en la posición ${i + 1}.`);
  }

  return tokens;
}

export function peek(cursor: Cursor): FormulaToken | undefined {
  return cursor.tokens[cursor.index];
}

export function isOp(token: FormulaToken | undefined, text: string): boolean {
  return token !== undefined && token.kind === "op" && token.text === text;
}

export function describeArity(fn: FormulaFunction): string {
  if (fn.maxArgs === Number.POSITIVE_INFINITY) return `al menos ${fn.minArgs} argumento(s)`;
  if (fn.minArgs === fn.maxArgs) return `${fn.minArgs} argumento(s)`;
  return `entre ${fn.minArgs} y ${fn.maxArgs} argumentos`;
}

// Un agregado recibe un nombre de campo pelado, no una expresion: lee la columna de un grupo
// repetible. Que `sumOf(1 + 2)` no compile es a proposito, no una limitacion por resolver.
export function parseAggregate(cursor: Cursor, callee: string): FormulaNode {
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

export function parseCall(cursor: Cursor, callee: string): FormulaNode {
  if (FORMULA_AGGREGATES[callee]) return parseAggregate(cursor, callee);

  const fn: FormulaFunction | undefined = FORMULA_FUNCTIONS[callee];

  if (!fn) throw new Error(`La función "${callee}" no existe.`);

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

  if (args.length < fn.minArgs || args.length > fn.maxArgs) {
    throw new Error(`"${callee}" espera ${describeArity(fn)} y recibió ${args.length}.`);
  }

  return { kind: "call", callee, args };
}

export function parsePrimary(cursor: Cursor): FormulaNode {
  const token: FormulaToken | undefined = peek(cursor);

  if (!token) throw new Error("La fórmula termina de forma inesperada.");

  if (token.kind === "number") {
    cursor.index += 1;
    return { kind: "number", value: Number.parseFloat(token.text) };
  }

  // Un identificador es una llamada solo si le sigue un parentesis; si no, es el nombre de un
  // campo. Por eso no hay palabras reservadas: un campo puede llamarse "max" sin chocar.
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

  throw new Error(`No se esperaba "${token.text}" en la posición ${token.pos + 1}.`);
}

export function parseUnary(cursor: Cursor): FormulaNode {
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
// unario y a primario. Cambiar quien llama a quien cambia la precedencia del lenguaje.
// El bucle while, en vez de recursion a la derecha, es lo que da asociatividad por izquierda.
export function parseTerm(cursor: Cursor): FormulaNode {
  let left: FormulaNode = parseUnary(cursor);

  while (isOp(peek(cursor), "*") || isOp(peek(cursor), "/")) {
    const operator: string = cursor.tokens[cursor.index].text;
    cursor.index += 1;
    left = { kind: "binary", operator, left, right: parseUnary(cursor) };
  }

  return left;
}

export function parseExpression(cursor: Cursor): FormulaNode {
  let left: FormulaNode = parseTerm(cursor);

  while (isOp(peek(cursor), "+") || isOp(peek(cursor), "-")) {
    const operator: string = cursor.tokens[cursor.index].text;
    cursor.index += 1;
    left = { kind: "binary", operator, left, right: parseTerm(cursor) };
  }

  return left;
}
