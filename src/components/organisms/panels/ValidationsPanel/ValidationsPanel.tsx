import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { supportsMaxLength } from "../../../../lib/fieldLength/fieldLength";
import { buildZodSchema } from "../../../../lib/zodSchema/zodSchema";
import { getAllFields, useFormStore } from "../../../../store/formStore";
import type { CanvasField, FieldValidations } from "../../../../types/field";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { TwoColumnFieldGroup } from "../../../atoms/TwoColumnFieldGroup/TwoColumnFieldGroup";
import { GeneratedSchemaPreview } from "../../../molecules/GeneratedSchemaPreview/GeneratedSchemaPreview";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
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
  // La longitud se declara una sola vez pero se cuenta distinto, asi que son dos controles: en
  // texto son caracteres y en numero digitos de la parte entera. Un select queda afuera de los dos
  // -- su valor es el id de una opcion y buildZodSchema ni mira la longitud.
  const countsChars: boolean = supportsMaxLength(field.type) && !isNumeric;
  // Un checkbox no tiene nada basico que declarar: no lleva "requerido" -su esquema es z.boolean()
  // y buildZodSchema nunca le agrega .optional()- ni longitud ni rango. La seccion quedaria vacia.
  const showsBasicRules: boolean = field.type !== "checkbox";

  if (isPresentationalField(field.type)) {
    return (
      <p className="text-xs text-fg-subtle">
        Este campo solo muestra contenido: no recibe un valor, así que no hay nada que validar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {showsBasicRules && (
        <PanelSection title="Reglas básicas">
          {field.type !== "checkbox" && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-fg">Campo requerido</span>
              <ToggleSwitch
                checked={v.required ?? false}
                onChange={(checked) => updateFieldValidations(field.id, { required: checked })}
                label="Marcar el campo como requerido"
              />
            </div>
          )}

          {countsChars && (
            <TwoColumnFieldGroup legend="Longitud">
              <LabeledInput
                id="min-length"
                label="Mínimo"
                type="number"
                min={0}
                placeholder="—"
                value={v.minLength ?? ""}
                onChange={(event) =>
                  updateFieldValidations(field.id, {
                    minLength: toNumberOrUndefined(event.target.value),
                  })
                }
              />
              <LabeledInput
                id="max-length"
                label="Máximo"
                type="number"
                min={0}
                placeholder="—"
                value={v.maxLength ?? ""}
                onChange={(event) =>
                  updateFieldValidations(field.id, {
                    maxLength: toNumberOrUndefined(event.target.value),
                  })
                }
              />
            </TwoColumnFieldGroup>
          )}

          {isNumeric && (
            <TwoColumnFieldGroup legend="Rango de valores">
              <LabeledInput
                id="min-value"
                label="Mínimo"
                type="number"
                placeholder="—"
                value={v.min ?? ""}
                onChange={(event) =>
                  updateFieldValidations(field.id, { min: toNumberOrUndefined(event.target.value) })
                }
              />
              <LabeledInput
                id="max-value"
                label="Máximo"
                type="number"
                placeholder="—"
                value={v.max ?? ""}
                onChange={(event) =>
                  updateFieldValidations(field.id, { max: toNumberOrUndefined(event.target.value) })
                }
              />
            </TwoColumnFieldGroup>
          )}

          {isNumeric && (
            <div>
              <LabeledInput
                id="max-digits"
                label="Máximo de dígitos"
                type="number"
                min={1}
                placeholder="—"
                value={v.maxLength ?? ""}
                onChange={(event) =>
                  updateFieldValidations(field.id, {
                    maxLength: toNumberOrUndefined(event.target.value),
                  })
                }
              />
              <p className="mt-1 text-[11px] text-fg-subtle">
                Cuenta los dígitos de la parte entera. Los puntos de miles, la coma decimal y el
                signo no cuentan.
              </p>
            </div>
          )}
        </PanelSection>
      )}

      {isTextLike && (
        <PanelSection title="Formato y mensaje">
          <LabeledInput
            id="pattern"
            label="Expresión regular"
            value={v.pattern ?? ""}
            onChange={(event) => updateFieldValidations(field.id, { pattern: event.target.value })}
            placeholder="^[0-9]+-[0-9]$"
            tone="code"
          />

          <LabeledInput
            id="error-message"
            label="Mensaje de error"
            value={v.message ?? ""}
            onChange={(event) => updateFieldValidations(field.id, { message: event.target.value })}
            placeholder="Formato inválido"
          />
        </PanelSection>
      )}

      <GeneratedSchemaPreview schema={buildZodSchema(field)} />

      <ValidationOverridesEditor field={field} candidates={candidates} />
    </div>
  );
}
