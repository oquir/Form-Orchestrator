import { useFieldScriptEditor } from "../../../../hooks/useFieldScriptEditor/useFieldScriptEditor";
import { Button } from "../../../atoms/Button/Button";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ScriptInput } from "../../../molecules/ScriptInput/ScriptInput";
import { SimpleCalcModal } from "../../SimpleCalcModal/SimpleCalcModal";
import {
  ERROR_CLASSES,
  HINT_CLASSES,
  READS_CLASSES,
  SCRIPT_DESCRIPTION,
  SCRIPT_PLACEHOLDER,
  SIMPLE_CALC_DESCRIPTION,
  WARNING_CLASSES,
} from "./FieldScriptEditor.constants";
import type { FieldScriptEditorProps } from "./FieldScriptEditor.types";

export function FieldScriptEditor({ field, candidates }: FieldScriptEditorProps) {
  const {
    source,
    knownNames,
    validation,
    cycle,
    readsSelf,
    dependencies,
    handleChange,
    offersSimpleCalc,
    isSimpleCalcOpen,
    openSimpleCalc,
    closeSimpleCalc,
  } = useFieldScriptEditor({ field, candidates });

  return (
    <PanelSection
      title="Cálculo del campo"
      description={
        offersSimpleCalc ? `${SCRIPT_DESCRIPTION}\n${SIMPLE_CALC_DESCRIPTION}` : SCRIPT_DESCRIPTION
      }
    >
      {offersSimpleCalc && (
        <Button
          variant="secondary"
          onClick={openSimpleCalc}
          className="px-3 py-1.5 text-xs hover:cursor-pointer"
        >
          Editar sin código
        </Button>
      )}

      <ScriptInput
        id="field-script"
        label="Script"
        value={source}
        rows={8}
        knownNames={knownNames}
        placeholder={SCRIPT_PLACEHOLDER}
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

      {isSimpleCalcOpen && (
        <SimpleCalcModal field={field} candidates={candidates} onClose={closeSimpleCalc} />
      )}
    </PanelSection>
  );
}
