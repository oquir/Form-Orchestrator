import { buildZodSchema } from "../../../lib/zodSchema";
import type { CanvasField } from "../../../store/formStore";
import { useFormStore } from "../../../store/formStore";
import { Checkbox } from "../../atoms/Checkbox";
import { GeneratedSchemaPreview } from "../../molecules/GeneratedSchemaPreview";
import { LabeledInput } from "../../molecules/LabeledInput";
import { TwoColumnFieldGroup } from "../../molecules/TwoColumnFieldGroup";

function toNumberOrUndefined(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}

export function ValidationsPanel({ field }: { field: CanvasField }) {
  const updateFieldValidations = useFormStore((state) => state.updateFieldValidations);
  const v = field.validations;
  const isNumeric = field.type === "number" || field.type === "calculated";
  const isTextLike = field.type === "text" || field.type === "textarea" || field.type === "select";

  return (
    <div className="flex flex-col gap-4">
      {field.type !== "checkbox" && (
        // biome-ignore lint/a11y/noLabelWithoutControl: Checkbox renders a nested <input type="checkbox">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
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
          <TwoColumnFieldGroup>
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
        <TwoColumnFieldGroup>
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
    </div>
  );
}
