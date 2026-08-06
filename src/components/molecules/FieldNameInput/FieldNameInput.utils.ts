import { collectFieldNames } from "../../../lib/fieldName/fieldName";
import type { FormStep, IntroModalStep } from "../../../types/formStructure";

// Los nombres se comparan contra los dos lienzos, no contra el activo: el export los mezcla en un
// unico espacio de nombres, asi que un campo del modal de intro choca con uno del formulario.
export function takenFieldNames(
  formSteps: FormStep[],
  introSteps: IntroModalStep[],
  exceptFieldId: string,
): Set<string> {
  return collectFieldNames(
    [...formSteps.flatMap((step) => step.rows), ...introSteps.flatMap((step) => step.rows)],
    exceptFieldId,
  );
}
