import type { FormulaFunction } from "../types/formula";

function roundTo(value: number, decimals: number): number {
  const factor: number = 10 ** Math.trunc(decimals);
  return Math.round(value * factor) / factor;
}

// Pesos oficiales DIAN, de derecha a izquierda sobre las cifras del NIT.
const DV_WEIGHTS: number[] = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

function digitoVerificacion(nit: number): number {
  if (!Number.isFinite(nit)) return 0;

  const digits: string = String(Math.trunc(Math.abs(nit)));
  let total = 0;

  for (let i = 0; i < digits.length && i < DV_WEIGHTS.length; i += 1) {
    total += Number(digits[digits.length - 1 - i]) * DV_WEIGHTS[i];
  }

  const remainder: number = total % 11;

  return remainder < 2 ? remainder : 11 - remainder;
}

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
  dvNit: { minArgs: 1, maxArgs: 1, apply: (args) => digitoVerificacion(args[0]) },
};

export const FORMULA_AGGREGATES: Record<string, (values: number[]) => number> = {
  sumOf: (values) => values.reduce((total, value) => total + value, 0),
  countOf: (values) => values.length,
};
