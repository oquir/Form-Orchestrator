import { compileScript } from "../fieldScript/fieldScript";
import { collectFormulaRefs, parseFormula } from "../formula/formula";

// Puente entre los dos espacios de nombres: las formulas hablan de campos por su nombre tecnico
// y el grafo trabaja con ids. Un nombre que no resuelve se descarta en silencio, porque el
// usuario esta escribiendo y a media palabra casi nada resuelve todavia.
export function formulaRefIds(source: string | undefined, byName: Map<string, string>): string[] {
  if (!source) return [];

  const ids: string[] = [];

  for (const name of collectFormulaRefs(parseFormula(source).ast)) {
    const id: string | undefined = byName.get(name);
    if (id) ids.push(id);
  }

  return ids;
}

// El script si entra al grafo, a diferencia de logic.typeScript, que quedaba fuera por ser una
// cadena que el builder no sabia leer. Con {campo} deja de serlo, y con eso la deteccion de ciclos
// por fin cubre el calculo.
export function scriptRefIds(
  source: string | undefined,
  byName: Map<string, string>,
  knownNames: Set<string>,
): string[] {
  if (!source) return [];

  const ids: string[] = [];

  for (const name of compileScript(source, knownNames).reads) {
    const id: string | undefined = byName.get(name);
    if (id) ids.push(id);
  }

  return ids;
}
