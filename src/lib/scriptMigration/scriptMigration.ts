import { parseFormula } from "./scriptMigration.parser";
import type { FormulaNode } from "./scriptMigration.types";
import { printNode } from "./scriptMigration.utils";

// Traduce el lenguaje de formulas al script. Es lo unico que queda de aquel lenguaje: el parser
// vive al lado, ya sin evaluador, y existe solo para que un borrador guardado antes de este cambio
// se pueda abrir. Si algun dia deja de haber borradores viejos dando vueltas, se borra la carpeta
// entera y con ella el ultimo rastro del formato.
//
// Solo se ocupa de `logic.formula` y de los efectos de regla; las reglas en si no son un lenguaje.

// Devuelve null si la formula no parsea. Que hacer con eso lo decide quien llama, que es la
// migracion del borrador: la conserva como comentario en vez de traducirla a medias.
export function formulaToScript(formula: string): string | null {
  const ast: FormulaNode | null = parseFormula(formula);
  if (ast === null) return null;

  return `return ${printNode(ast, 0, false)};`;
}
