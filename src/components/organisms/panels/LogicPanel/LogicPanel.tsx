import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { getAllFields, useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/field";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { DependencyCheckboxRow } from "../../../molecules/DependencyCheckboxRow/DependencyCheckboxRow";
import { LabeledTextarea } from "../../../molecules/LabeledTextarea/LabeledTextarea";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ConditionEditor } from "../ConditionEditor/ConditionEditor";
import { FieldRulesEditor } from "../FieldRulesEditor/FieldRulesEditor";
import { COUNT_CLASSES, HINT_CLASSES } from "./LogicPanel.constants";

export function LogicPanel({ field }: { field: CanvasField }) {
  const formSteps = useFormStore((state) => state.formSteps);
  const toggleFieldDependency = useFormStore((state) => state.toggleFieldDependency);
  const updateFieldLogic = useFormStore((state) => state.updateFieldLogic);
  const updateField = useFormStore((state) => state.updateField);

  const allFields: CanvasField[] = getAllFields(formSteps.flatMap((step) => step.rows));
  const otherFields: CanvasField[] = allFields.filter(
    (candidate) => candidate.id !== field.id && !isPresentationalField(candidate.type),
  );
  const isAlwaysDisabled = Boolean(field.alwaysDisabled);
  const dependencyCount: number = field.logic.dependencies.length;

  // Un campo presentacional no tiene valor: se puede ocultar, pero no habilitar,
  // ni calcular, ni observar desde una regla.
  if (isPresentationalField(field.type)) {
    return (
      <div className="flex flex-col gap-3">
        <ConditionEditor field={field} otherFields={otherFields} kind="visible" />
        <p className={HINT_CLASSES}>
          Este campo solo muestra contenido, así que no tiene habilitación condicional, fórmula ni
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

      <FieldRulesEditor field={field} candidates={otherFields} />

      <PanelSection
        title="Depende de (para el script)"
        aside={
          dependencyCount > 0 ? <span className={COUNT_CLASSES}>{dependencyCount}</span> : null
        }
      >
        <p className={HINT_CLASSES}>
          Marca campos cuyo valor lee el script TS de abajo. La condición de habilitación se maneja
          arriba, no acá.
        </p>

        {otherFields.length === 0 ? (
          <p className={HINT_CLASSES}>No hay otros campos en el lienzo todavía.</p>
        ) : (
          <ul className="flex list-none flex-col gap-1.5">
            {otherFields.map((candidate) => (
              <li key={candidate.id}>
                <DependencyCheckboxRow
                  label={candidate.label}
                  type={candidate.type}
                  checked={field.logic.dependencies.includes(candidate.id)}
                  onChange={() => toggleFieldDependency(field.id, candidate.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </PanelSection>

      <PanelSection title="Script TypeScript">
        <LabeledTextarea
          id="logic-typescript"
          label="Script TypeScript"
          labelHidden
          variant="code"
          rows={8}
          value={field.logic.typeScript}
          onChange={(event) => updateFieldLogic(field.id, { typeScript: event.target.value })}
          placeholder={
            "onChange(val => {\n  if (val > getFieldValue('otro_campo')) {\n    alert('No puede ser mayor');\n  }\n});"
          }
          spellCheck={false}
        />
      </PanelSection>
    </div>
  );
}
