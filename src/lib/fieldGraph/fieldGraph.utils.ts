import { collectFormulaRefs, parseFormula } from "../formula/formula";

export function formulaRefIds(source: string | undefined, byName: Map<string, string>): string[] {
  if (!source) return [];

  const ids: string[] = [];

  for (const name of collectFormulaRefs(parseFormula(source).ast)) {
    const id: string | undefined = byName.get(name);
    if (id) ids.push(id);
  }

  return ids;
}
