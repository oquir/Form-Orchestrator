import { useMemo } from "react";
import { dependencyCandidates } from "../../lib/fieldCandidates/fieldCandidates";
import { useFormStore } from "../../store/formStore";
import type { CanvasField } from "../../types/field";

// Los campos que un panel ofrece para que `fieldId` dependa de ellos. Logica, Validaciones y Mapeo
// API leen la lista de aca y no la arman cada uno, para que la regla de que el modal no mira al
// formulario no se cumpla en un panel y en otro no.
export function useDependencyCandidates(fieldId: string): CanvasField[] {
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);

  return useMemo(
    () => dependencyCandidates(fieldId, formSteps, introSteps),
    [fieldId, formSteps, introSteps],
  );
}
