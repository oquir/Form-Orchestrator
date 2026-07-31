import type { FormulaFunction } from "../../types/formula";
import { roundTo } from "./formula.utils";

export const DIGIT = /[0-9]/;
export const IDENT_START = /[A-Za-z_]/;
export const IDENT_PART = /[A-Za-z0-9_]/;
export const WHITESPACE = /\s/;

export const FORMULA_FUNCTIONS: Record<string, FormulaFunction> = {
  abs: { minArgs: 1, maxArgs: 1, apply: (args) => Math.abs(args[0]) },
  min: { minArgs: 1, maxArgs: Number.POSITIVE_INFINITY, apply: (args) => Math.min(...args) },
  max: { minArgs: 1, maxArgs: Number.POSITIVE_INFINITY, apply: (args) => Math.max(...args) },
  sum: {
    minArgs: 1,
    maxArgs: Number.POSITIVE_INFINITY,
    apply: (args) => args.reduce((a, b) => a + b, 0),
  },
  round: { minArgs: 1, maxArgs: 2, apply: (args) => roundTo(args[0], args[1] ?? 0) },
  floor: { minArgs: 1, maxArgs: 1, apply: (args) => Math.floor(args[0]) },
  ceil: { minArgs: 1, maxArgs: 1, apply: (args) => Math.ceil(args[0]) },
};

export const FORMULA_OPERATORS: string[] = ["+", "-", "*", "/", "(", ")", ","];

export const FORMULA_AGGREGATES: Record<string, (values: number[]) => number> = {
  sumOf: (values) => values.reduce((total, value) => total + value, 0),
  countOf: (values) => values.length,
};
