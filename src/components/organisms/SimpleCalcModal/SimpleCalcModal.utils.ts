import type { CalcTermDraft } from "../../../types/simpleCalc";

export function chosenFieldsLabel(terms: CalcTermDraft[]): string {
  const count: number = terms.filter((term) => term.fieldId !== null).length;

  if (count === 0) return "Ningún campo elegido";

  return count === 1 ? "1 campo elegido" : `${count} campos elegidos`;
}
