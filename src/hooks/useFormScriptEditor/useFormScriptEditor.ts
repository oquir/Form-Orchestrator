import { useMemo } from "react";
import { validatePrelude } from "../../lib/fieldScript/fieldScript";
import { getAllFields, useFormStore } from "../../store/formStore";
import type { PreludeValidation } from "../../types/fieldScript";
import type { UseFormScriptEditorResult } from "./useFormScriptEditor.types";

export function useFormScriptEditor(): UseFormScriptEditorResult {
  const formScript = useFormStore((state) => state.formScript);
  const setFormScript = useFormStore((state) => state.setFormScript);
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);

  // Los dos lienzos comparten espacio de nombres, asi que el aviso de "esto es un campo" tiene que
  // mirarlos juntos.
  const knownNames: Set<string> = useMemo(() => {
    const rows = [
      ...formSteps.flatMap((step) => step.rows),
      ...introSteps.flatMap((step) => step.rows),
    ];

    return new Set(getAllFields(rows).map((field) => field.name));
  }, [formSteps, introSteps]);

  const validation: PreludeValidation = useMemo(
    () => validatePrelude(formScript, knownNames),
    [formScript, knownNames],
  );

  return {
    formScript,
    setFormScript,
    knownNames,
    validation,
  };
}
