import { useFormScriptEditor } from "../../../../hooks/useFormScriptEditor/useFormScriptEditor";
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
  const { formScript, setFormScript, knownNames, validation } = useFormScriptEditor();

  return (
    <PanelSection title="Script del formulario">
      <ScriptInput
        id="form-script"
        label="Funciones compartidas"
        value={formScript}
        rows={12}
        knownNames={knownNames}
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
