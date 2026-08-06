import { useFormStore } from "../../../../store/formStore";
import type { FieldValidationOverride } from "../../../../types/field";
import { DashedAddButton } from "../../../atoms/DashedAddButton/DashedAddButton";
import { ValidationOverrideCard } from "../../../molecules/ValidationOverrideCard/ValidationOverrideCard";
import { HINT_CLASSES } from "./ValidationOverridesEditor.constants";
import type { ValidationOverridesEditorProps } from "./ValidationOverridesEditor.types";

export function ValidationOverridesEditor({ field, candidates }: ValidationOverridesEditorProps) {
  const addOverride = useFormStore((state) => state.addFieldValidationOverride);
  const overrides: FieldValidationOverride[] = field.validations.overrides ?? [];

  return (
    <section aria-labelledby="validation-overrides-heading" className="flex flex-col gap-2">
      <h3
        id="validation-overrides-heading"
        className="text-xs font-medium text-slate-500 dark:text-neutral-400"
      >
        Validaciones condicionales
      </h3>

      <p className={HINT_CLASSES}>
        Cambian la validación de este campo según el valor de otro. Gana la primera que se cumpla;
        si ninguna se cumple queda la de arriba. Lo que no declares acá se hereda de ella.
      </p>

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
        <DashedAddButton
          onClick={() => addOverride(field.id)}
          className="border-slate-300 px-2 py-1.5 text-slate-500 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-600 dark:text-neutral-400"
        >
          + Agregar validación condicional
        </DashedAddButton>
      )}
    </section>
  );
}
