import { InfoCircle } from "reicon-react";
import { useFormStore } from "../../../../store/formStore";
import type { FieldValidationOverride } from "../../../../types/field";
import { DashedAddButton } from "../../../atoms/DashedAddButton/DashedAddButton";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ValidationOverrideCard } from "../../../molecules/ValidationOverrideCard/ValidationOverrideCard";
import { ADD_BUTTON_CLASSES, HINT, HINT_CLASSES } from "./ValidationOverridesEditor.constants";
import type { ValidationOverridesEditorProps } from "./ValidationOverridesEditor.types";

export function ValidationOverridesEditor({ field, candidates }: ValidationOverridesEditorProps) {
  const addOverride = useFormStore((state) => state.addFieldValidationOverride);
  const overrides: FieldValidationOverride[] = field.validations.overrides ?? [];

  return (
    <PanelSection
      title="Validaciones condicionales"
      aside={
        <span title={HINT} className="text-fg-subtle">
          <InfoCircle size={13} />
        </span>
      }
    >
      {/* La regla de precedencia solo hace falta leerla cuando ya hay algo que ordenar; con la
          lista vacia el icono del encabezado alcanza y el panel arranca mas corto. */}
      {overrides.length > 0 && <p className={HINT_CLASSES}>{HINT}</p>}

      {candidates.length === 0 && overrides.length === 0 && (
        <p className={HINT_CLASSES}>No hay otros campos que observar todavía.</p>
      )}

      {overrides.map((override, index) => (
        <ValidationOverrideCard
          key={override.id}
          field={field}
          override={override}
          candidates={candidates}
          position={index + 1}
        />
      ))}

      {candidates.length > 0 && (
        <DashedAddButton onClick={() => addOverride(field.id)} className={ADD_BUTTON_CLASSES}>
          + Agregar validación condicional
        </DashedAddButton>
      )}
    </PanelSection>
  );
}
