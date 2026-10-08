import { useDependencyCandidates } from "../../../../hooks/useDependencyCandidates/useDependencyCandidates";
import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/field";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ConditionEditor } from "../ConditionEditor/ConditionEditor";
import { FieldRulesEditor } from "../FieldRulesEditor/FieldRulesEditor";
import { FieldScriptEditor } from "../FieldScriptEditor/FieldScriptEditor";
import { HINT_CLASSES, READ_ONLY_DESCRIPTION } from "./LogicPanel.constants";

export function LogicPanel({ field }: { field: CanvasField }) {
  const updateField = useFormStore((state) => state.updateField);

  const otherFields: CanvasField[] = useDependencyCandidates(field.id);
  const isAlwaysDisabled = Boolean(field.alwaysDisabled);

  // Un campo presentacional no tiene valor: se puede ocultar, pero no habilitar,
  // ni calcular, ni observar desde una regla.
  if (isPresentationalField(field.type)) {
    return (
      <div className="flex flex-col gap-3">
        <ConditionEditor field={field} otherFields={otherFields} kind="visible" />
        <p className={HINT_CLASSES}>
          Este campo solo muestra contenido, así que no tiene habilitación condicional, cálculo ni
          reglas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <PanelSection
        title="Solo lectura"
        description={READ_ONLY_DESCRIPTION}
        aside={
          <ToggleSwitch
            checked={isAlwaysDisabled}
            onChange={(checked) => updateField(field.id, { alwaysDisabled: checked })}
            label="Dejar el campo siempre deshabilitado"
          />
        }
      />

      <ConditionEditor field={field} otherFields={otherFields} kind="visible" />

      {!isAlwaysDisabled && (
        <ConditionEditor field={field} otherFields={otherFields} kind="enable" />
      )}

      <FieldScriptEditor field={field} candidates={otherFields} />

      <FieldRulesEditor field={field} candidates={otherFields} />
    </div>
  );
}
