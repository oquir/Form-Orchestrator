import { useFieldScriptEditor } from "../../../../hooks/useFieldScriptEditor/useFieldScriptEditor";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ScriptInput } from "../../../molecules/ScriptInput/ScriptInput";
import {
  DATE_HELPERS_HINT,
  ERROR_CLASSES,
  HINT_CLASSES,
  READS_CLASSES,
  SCRIPT_HINT,
  SCRIPT_PLACEHOLDER,
  SCRIPT_SCOPE_HINT,
  WARNING_CLASSES,
} from "./FieldScriptEditor.constants";
import type { FieldScriptEditorProps } from "./FieldScriptEditor.types";

export function FieldScriptEditor({ field, candidates }: FieldScriptEditorProps) {
  const { source, knownNames, validation, cycle, readsSelf, dependencies, handleChange } =
    useFieldScriptEditor({ field, candidates });

  return (
    <PanelSection title="Cálculo del campo">
      <ScriptInput
        id="field-script"
        label="Script"
        value={source}
        rows={8}
        knownNames={knownNames}
        placeholder={SCRIPT_PLACEHOLDER}
        insertCandidates={candidates}
        onChange={handleChange}
      />

      {validation.error && <p className={ERROR_CLASSES}>{validation.error}</p>}

      {cycle && <p className={ERROR_CLASSES}>Dependencia circular: {cycle}.</p>}

      {readsSelf && (
        <p className={WARNING_CLASSES}>
          El script se lee a sí mismo ({field.name}); ese valor no va a poder resolverse. Para leer
          lo que hay escrito en el campo usá <code className="font-mono">value</code>.
        </p>
      )}

      {validation.unknown.length > 0 && (
        <p className={WARNING_CLASSES}>
          {validation.unknown.map((name) => `{${name}}`).join(", ")} no coincide con ningún campo,
          así que se deja tal cual como JavaScript.
        </p>
      )}

      {dependencies.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className={HINT_CLASSES}>Lee estos campos:</span>
          <ul className="flex list-none flex-wrap gap-1">
            {dependencies.map((dependency) => (
              <li key={dependency.id} className={READS_CLASSES} title={dependency.label}>
                {dependency.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={HINT_CLASSES}>{SCRIPT_HINT}</p>
      <p className={HINT_CLASSES}>{SCRIPT_SCOPE_HINT}</p>
      <p className={HINT_CLASSES}>{DATE_HELPERS_HINT}</p>
    </PanelSection>
  );
}
