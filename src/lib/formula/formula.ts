import { FORMULA_FUNCTIONS, FORMULA_OPERATORS } from "./formula.constants";
import type {
  FormulaFunction,
  FormulaNode,
  FormulaParseResult,
  FormulaToken,
  FormulaValidation,
} from "./formula.types";

const DIGIT = /[0-9]/;
const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;
const WHITESPACE = /\s/;

interface Cursor {
  tokens: FormulaToken[];
  index: number;
}

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

    throw new Error(`Carácter no válido "${char}" en la posición ${i + 1}.`);
  }

  return tokens;
}

function peek(cursor: Cursor): FormulaToken | undefined {
  return cursor.tokens[cursor.index];
}

function isOp(token: FormulaToken | undefined, text: string): boolean {
  return token !== undefined && token.kind === "op" && token.text === text;
}

function describeArity(fn: FormulaFunction): string {
  if (fn.maxArgs === Number.POSITIVE_INFINITY) return `al menos ${fn.minArgs} argumento(s)`;
  if (fn.minArgs === fn.maxArgs) return `${fn.minArgs} argumento(s)`;
  return `entre ${fn.minArgs} y ${fn.maxArgs} argumentos`;
}

function parseCall(cursor: Cursor, callee: string): FormulaNode {
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

function parsePrimary(cursor: Cursor): FormulaNode {
  const token: FormulaToken | undefined = peek(cursor);

  if (!token) throw new Error("La fórmula termina de forma inesperada.");

  if (token.kind === "number") {
    cursor.index += 1;
    return { kind: "number", value: Number.parseFloat(token.text) };
  }

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

export function parseFormula(source: string): FormulaParseResult {
  const trimmed: string = source.trim();

  if (trimmed.length === 0) return { ast: null, error: null };

  try {
    const cursor: Cursor = { tokens: tokenize(trimmed), index: 0 };
    const ast: FormulaNode = parseExpression(cursor);
    const leftover: FormulaToken | undefined = peek(cursor);

    if (leftover) {
      throw new Error(`Sobra "${leftover.text}" en la posición ${leftover.pos + 1}.`);
    }

    return { ast, error: null };
  } catch (error) {
    return { ast: null, error: error instanceof Error ? error.message : "Fórmula no válida." };
  }
}

export function collectFormulaRefs(ast: FormulaNode | null): string[] {
  const refs: string[] = [];
  const seen = new Set<string>();
  const stack: FormulaNode[] = ast ? [ast] : [];

  while (stack.length > 0) {
    const node: FormulaNode = stack.pop() as FormulaNode;

    switch (node.kind) {
      case "ref":
        if (!seen.has(node.name)) {
          seen.add(node.name);
          refs.push(node.name);
        }
        break;
      case "unary":
        stack.push(node.operand);
        break;
      case "binary":
        stack.push(node.right, node.left);
        break;
      case "call":
        for (const arg of [...node.args].reverse()) stack.push(arg);
        break;
      default:
        break;
    }
  }

  return refs;
}

export function validateFormula(source: string, knownNames: Set<string>): FormulaValidation {
  const { ast, error } = parseFormula(source);
  const refs: string[] = collectFormulaRefs(ast);
  const unknownRefs: string[] = refs.filter((ref) => !knownNames.has(ref));
  const isEmpty: boolean = ast === null && error === null;

  return {
    ast,
    error,
    refs,
    unknownRefs,
    isEmpty,
    isValid: error === null && unknownRefs.length === 0,
  };
}

export function toFormulaNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean") return value ? 1 : 0;

  if (typeof value === "string") {
    const trimmed: string = value.trim();
    if (trimmed.length === 0) return 0;
    const parsed: number = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function evaluateFormula(
  ast: FormulaNode | null,
  values: Record<string, unknown>,
): number | null {
  if (!ast) return null;

  switch (ast.kind) {
    case "number":
      return ast.value;

    case "ref":
      return toFormulaNumber(values[ast.name]);

    case "unary": {
      const operand: number | null = evaluateFormula(ast.operand, values);
      return operand === null ? null : -operand;
    }

    case "binary": {
      const left: number | null = evaluateFormula(ast.left, values);
      const right: number | null = evaluateFormula(ast.right, values);

      if (left === null || right === null) return null;

      switch (ast.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return right === 0 ? null : left / right;
        default:
          return null;
      }
    }

    case "call": {
      const args: number[] = [];

      for (const arg of ast.args) {
        const value: number | null = evaluateFormula(arg, values);
        if (value === null) return null;
        args.push(value);
      }

      const result: number = FORMULA_FUNCTIONS[ast.callee].apply(args);
      return Number.isFinite(result) ? result : null;
    }

    default:
      return null;
  }
}
