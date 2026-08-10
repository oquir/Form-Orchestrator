import { useMemo } from "react";
import { validatePrelude } from "../../../../lib/fieldScript/fieldScript";
import { getAllFields, useFormStore } from "../../../../store/formStore";
import type { PreludeValidation } from "../../../../types/fieldScript";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ScriptInput } from "../../../molecules/ScriptInput/ScriptInput";
import {
  ERROR_CLASSES,
  HINT_CLASSES,
  PRELUDE_HINT,
  PRELUDE_PLACEHOLDER,
  PRELUDE_SCOPE_HINT,
} from "./FormScriptEditor.constants";

export function FormScriptEditor() {
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

  return (
    <PanelSection title="Script del formulario">
      <ScriptInput
        id="form-script"
        label="Funciones compartidas"
        value={formScript}
        rows={12}
        placeholder={PRELUDE_PLACEHOLDER}
        onChange={setFormScript}
      />

      {validation.error && <p className={ERROR_CLASSES}>{validation.error}</p>}

      {validation.refs.length > 0 && (
        <p className={ERROR_CLASSES}>
          {validation.refs.map((ref) => `{${ref.name}}`).join(", ")}: el script del formulario no
          puede leer campos. Pasá el valor por parámetro desde el script del campo.
        </p>
      )}

      <p className={HINT_CLASSES}>{PRELUDE_HINT}</p>
      <p className={HINT_CLASSES}>{PRELUDE_SCOPE_HINT}</p>
    </PanelSection>
  );
}
