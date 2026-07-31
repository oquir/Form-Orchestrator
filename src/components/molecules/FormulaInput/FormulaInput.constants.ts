import { FORMULA_AGGREGATES, FORMULA_FUNCTIONS } from "../../../lib/formula/formula.constants";

export const FORMULA_TEXTAREA_CLASSES: string =
  "w-full rounded-md border border-border bg-field px-2 py-1 font-mono text-xs text-fg outline-none focus:border-brand-border";

export const FORMULA_SELECT_CLASSES: string =
  "rounded-md border border-border bg-field px-2 py-1 text-[11px] text-fg-soft outline-none focus:border-brand-border";

export const FORMULA_HELP: string =
  "Referenciá campos por su nombre técnico. Operadores + - * / y paréntesis.";

export const FUNCTION_NAMES: string = Object.keys(FORMULA_FUNCTIONS).join(", ");
export const AGGREGATE_NAMES: string = Object.keys(FORMULA_AGGREGATES).join(", ");
