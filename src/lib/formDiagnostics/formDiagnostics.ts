import type { DiagnoseFormInput, FormProblem } from "../../types/formDiagnostics";
import type { LocatedItems, PreludeCheck, ProblemDraft } from "./formDiagnostics.types";
import {
  checkPrelude,
  conditionPatternProblems,
  cycleProblems,
  fieldCssProblems,
  groupCheckProblems,
  locateItems,
  mappingProblems,
  patternProblems,
  rowCssProblems,
  scriptProblems,
} from "./formDiagnostics.utils";

// Revision del formulario antes de exportar. Junta en una sola lista lo que los editores ya avisan
// por separado -- scripts que no compilan, ciclos, mapeos huerfanos, CSS no reconocido -- y lo que
// nadie revisaba: la regex de `pattern` y de las condiciones `matches`, y los scripts de los
// efectos de reglas.
//
// Un error es algo que se sabe roto y bloquea la exportacion; un aviso puede ser a proposito. Los
// `⚠ tipo` y la cobertura del payload quedan fuera a proposito: siguen en Mapeo API y en la vista
// Payload. Sin React ni store, y sin nada del simulador: corre del lado del builder y no puede
// arrastrar el chunk perezoso.

export function diagnoseForm(input: DiagnoseFormInput): FormProblem[] {
  const items: LocatedItems = locateItems(input);
  // Los mismos nombres que arma buildFormExport: los dos lienzos comparten espacio de nombres, asi
  // que cada {{x}} se juzga con el mismo criterio con que se va a compilar.
  const knownNames: Set<string> = new Set(items.fields.map((located) => located.field.name));
  const prelude: PreludeCheck = checkPrelude(input.formScript);

  const drafts: ProblemDraft[] = [
    ...prelude.problems,
    ...items.fields.flatMap((located) => [
      ...scriptProblems(located, knownNames, prelude.prelude),
      ...patternProblems(located),
      ...conditionPatternProblems(located),
      ...mappingProblems(located),
      ...fieldCssProblems(located),
    ]),
    ...items.rows.flatMap((located) => rowCssProblems(located)),
    ...items.groups.flatMap((located) => groupCheckProblems(located, knownNames, prelude.prelude)),
    ...cycleProblems(items.fields),
  ];

  // Errores primero; dentro de cada gravedad queda el orden del formulario.
  const ordered: ProblemDraft[] = [
    ...drafts.filter((draft) => draft.severity === "error"),
    ...drafts.filter((draft) => draft.severity === "warning"),
  ];

  return ordered.map((draft, index) => ({ ...draft, id: `problema-${index}` }));
}
