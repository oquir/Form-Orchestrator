import type { FormulaNode } from "../../types/formula";

export interface DerivedPlan {
  order: string[];
  cycle: string[] | null;
  asts: Map<string, FormulaNode | null>;
}
