import { FORMULA_AGGREGATES, FORMULA_FUNCTIONS } from "./formula.constants";
import type {
  Cursor,
  FormulaNode,
  FormulaParseResult,
  FormulaToken,
  FormulaValidation,
} from "./formula.types";
import { parseExpression, peek, tokenize } from "./formula.utils";

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
      case "aggregate":
        if (!seen.has(node.ref)) {
          seen.add(node.ref);
          refs.push(node.ref);
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

    case "aggregate": {
      const raw: unknown = values[ast.ref];
      const items: unknown[] = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw];

      return FORMULA_AGGREGATES[ast.fn](items.map(toFormulaNumber));
    }

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
