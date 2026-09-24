import type { ScriptRef } from "../../types/fieldScript";
import { fieldRefText, findScriptRefs } from "../fieldScript/fieldScript";
import { LEGACY_REF_PATTERN } from "./scriptMigration.constants";
import { parseFormula } from "./scriptMigration.parser";
import type { FormulaNode } from "./scriptMigration.types";
import { printNode } from "./scriptMigration.utils";

// Las dos traducciones de formatos viejos del script, y lo unico que queda de ellos: el lenguaje
// de formulas (borradores anteriores a la version 3) y la referencia de una sola llave (anteriores
// a la 7). Existen solo para que un borrador guardado antes de cada cambio se pueda abrir. Si algun
// dia deja de haber borradores viejos dando vueltas, se borra la carpeta entera y con ella el
// ultimo rastro de los dos formatos.
//
// De las formulas solo se ocupa de `logic.formula` y de los efectos de regla; las reglas en si no
// son un lenguaje.

// Devuelve null si la formula no parsea. Que hacer con eso lo decide quien llama, que es la
// migracion del borrador: la conserva como comentario en vez de traducirla a medias.
export function formulaToScript(formula: string): string | null {
  const ast: FormulaNode | null = parseFormula(formula);
  if (ast === null) return null;

  return `return ${printNode(ast, 0, false)};`;
}

// {campo} pasa a {{campo}}, pero solo donde el compilador viejo sustituia: un campo conocido, en
// codigo. Un {a} que no era campo era JS del autor -- una desestructuracion -- y se queda como
// esta; lo mismo lo que haya en strings y comentarios. Con eso el script migrado compila al mismo
// cuerpo que el original, que es lo que ejecutan el simulador y el consumidor.
export function upgradeFieldRefs(source: string, knownNames: Set<string>): string {
  const refs: ScriptRef[] = findScriptRefs(source, knownNames, LEGACY_REF_PATTERN).filter(
    (ref) => ref.known,
  );

  // De atras hacia adelante: cada reemplazo es mas largo que lo que tapa, y empezando por el
  // principio correria las posiciones de todas las referencias que vienen despues.
  let upgraded: string = source;
  for (const ref of [...refs].reverse()) {
    upgraded = `${upgraded.slice(0, ref.start)}${fieldRefText(ref.name)}${upgraded.slice(ref.end)}`;
  }

  return upgraded;
}
