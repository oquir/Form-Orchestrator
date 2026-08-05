import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { buildZodSchema } from "../../../../lib/zodSchema/zodSchema";
import { getAllFields, useFormStore } from "../../../../store/formStore";
import type { CanvasField, FieldValidations } from "../../../../types/field";
import { Checkbox } from "../../../atoms/Checkbox/Checkbox";
import { TwoColumnFieldGroup } from "../../../atoms/TwoColumnFieldGroup/TwoColumnFieldGroup";
import { GeneratedSchemaPreview } from "../../../molecules/GeneratedSchemaPreview/GeneratedSchemaPreview";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import { ValidationOverridesEditor } from "../ValidationOverridesEditor/ValidationOverridesEditor";
import { toNumberOrUndefined } from "./ValidationsPanel.utils";

export function ValidationsPanel({ field }: { field: CanvasField }) {
  const updateFieldValidations = useFormStore((state) => state.updateFieldValidations);
  const formSteps = useFormStore((state) => state.formSteps);
  const v: FieldValidations = field.validations;
  // Mismo criterio que LogicPanel: solo campos con valor, y nunca el propio.
  const candidates: CanvasField[] = getAllFields(formSteps.flatMap((step) => step.rows)).filter(
    (candidate) => candidate.id !== field.id && !isPresentationalField(candidate.type),
  );
  const isNumeric = field.type === "number" || field.type === "calculated";
  const isTextLike = field.type === "text" || field.type === "textarea" || field.type === "select";

  if (isPresentationalField(field.type)) {
    return (
      <p className="text-xs text-fg-subtle">
        Este campo solo muestra contenido: no recibe un valor, así que no hay nada que validar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {field.type !== "checkbox" && (
        // biome-ignore lint/a11y/noLabelWithoutControl: Checkbox renders a nested <input type="checkbox">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-200">
          <Checkbox
            checked={v.required ?? false}
            onChange={(event) =>
              updateFieldValidations(field.id, { required: event.target.checked })
            }
          />
          Campo requerido
        </label>
      )}

      {isTextLike && (
        <>
          <TwoColumnFieldGroup legend="Longitud">
            <LabeledInput
              id="min-length"
              label="Longitud mín."
              type="number"
              min={0}
              value={v.minLength ?? ""}
              onChange={(event) =>
                updateFieldValidations(field.id, {
                  minLength: toNumberOrUndefined(event.target.value),
                })
              }
            />
            <LabeledInput
              id="max-length"
              label="Longitud máx."
              type="number"
              min={0}
              value={v.maxLength ?? ""}
              onChange={(event) =>
                updateFieldValidations(field.id, {
                  maxLength: toNumberOrUndefined(event.target.value),
                })
              }
            />
          </TwoColumnFieldGroup>

          <LabeledInput
            id="pattern"
            label="Expresión regular"
            value={v.pattern ?? ""}
            onChange={(event) => updateFieldValidations(field.id, { pattern: event.target.value })}
            placeholder="^[0-9]+-[0-9]$"
            className="font-mono"
          />

          <LabeledInput
            id="error-message"
            label="Mensaje de error"
            value={v.message ?? ""}
            onChange={(event) => updateFieldValidations(field.id, { message: event.target.value })}
            placeholder="Formato inválido"
          />
        </>
      )}

      {isNumeric && (
        <TwoColumnFieldGroup legend="Rango de valores">
          <LabeledInput
            id="min-value"
            label="Valor mín."
            type="number"
            value={v.min ?? ""}
            onChange={(event) =>
              updateFieldValidations(field.id, { min: toNumberOrUndefined(event.target.value) })
            }
          />
          <LabeledInput
            id="max-value"
            label="Valor máx."
            type="number"
            value={v.max ?? ""}
            onChange={(event) =>
              updateFieldValidations(field.id, { max: toNumberOrUndefined(event.target.value) })
            }
          />
        </TwoColumnFieldGroup>
      )}

      <GeneratedSchemaPreview schema={buildZodSchema(field)} />

      <ValidationOverridesEditor field={field} candidates={candidates} />
    </div>
  );
}
