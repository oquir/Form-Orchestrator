import { useMemo } from "react";
import { validatePrelude } from "../../lib/fieldScript/fieldScript";
import { useFormStore } from "../../store/formStore";
import type { PreludeValidation } from "../../types/fieldScript";
import { useKnownFieldNames } from "../useKnownFieldNames/useKnownFieldNames";
import type { UseFormScriptEditorResult } from "./useFormScriptEditor.types";

export function useFormScriptEditor(): UseFormScriptEditorResult {
  const formScript = useFormStore((state) => state.formScript);
  const setFormScript = useFormStore((state) => state.setFormScript);

  // Los dos lienzos comparten espacio de nombres, asi que el aviso de "esto es un campo" tiene que
  // mirarlos juntos.
  const knownNames: Set<string> = useKnownFieldNames();

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
