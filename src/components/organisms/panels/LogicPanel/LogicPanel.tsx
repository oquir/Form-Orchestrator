import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { getAllFields, useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/field";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ConditionEditor } from "../ConditionEditor/ConditionEditor";
import { FieldRulesEditor } from "../FieldRulesEditor/FieldRulesEditor";
import { FieldScriptEditor } from "../FieldScriptEditor/FieldScriptEditor";
import { HINT_CLASSES } from "./LogicPanel.constants";

export function LogicPanel({ field }: { field: CanvasField }) {
  const formSteps = useFormStore((state) => state.formSteps);
  const updateField = useFormStore((state) => state.updateField);

  const allFields: CanvasField[] = getAllFields(formSteps.flatMap((step) => step.rows));
  const otherFields: CanvasField[] = allFields.filter(
    (candidate) => candidate.id !== field.id && !isPresentationalField(candidate.type),
  );
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
        aside={
          <ToggleSwitch
            checked={isAlwaysDisabled}
            onChange={(checked) => updateField(field.id, { alwaysDisabled: checked })}
            label="Dejar el campo siempre deshabilitado"
          />
        }
      >
        <p className={HINT_CLASSES}>
          El campo se muestra pero el usuario no puede editarlo. Útil para valores calculados o
          informativos.
        </p>
      </PanelSection>

      <ConditionEditor field={field} otherFields={otherFields} kind="visible" />

      {!isAlwaysDisabled && (
        <ConditionEditor field={field} otherFields={otherFields} kind="enable" />
      )}

      <FieldScriptEditor field={field} candidates={otherFields} />

      <FieldRulesEditor field={field} candidates={otherFields} />
    </div>
  );
}
