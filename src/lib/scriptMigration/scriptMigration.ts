import type { FormulaParseResult } from "../../types/formula";
import { parseFormula } from "../formula/formula";
import { printNode } from "./scriptMigration.utils";

// Traduce el lenguaje de formulas al script. Lee con el parser viejo y escribe JS: el AST ya
// existe, asi que la conversion es un impresor y no un segundo parser que pueda discrepar.
//
// Solo se ocupa de `logic.formula`. Las reglas siguen siendo reglas -- no son un lenguaje, son
// una estructura -- y el lenguaje de sus efectos se migra aparte, junto con la plantilla.

// Devuelve null si la formula no parsea. Quien llama deja el campo como estaba: seguir calculando
// por el camino viejo es mejor que convertir a medias y que el campo empiece a dar cualquier cosa.
export function formulaToScript(formula: string): string | null {
  const { ast, error }: FormulaParseResult = parseFormula(formula);
  if (error !== null || ast === null) return null;

  return `return ${printNode(ast, 0, false)};`;
}
