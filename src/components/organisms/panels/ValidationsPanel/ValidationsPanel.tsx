import { useDependencyCandidates } from "../../../../hooks/useDependencyCandidates/useDependencyCandidates";
import { builtInFormatOf, isContactField } from "../../../../lib/fieldContact/fieldContact";
import { isDateFieldType } from "../../../../lib/fieldDate/fieldDate";
import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { supportsMaxLength } from "../../../../lib/fieldLength/fieldLength";
import { buildZodSchema } from "../../../../lib/zodSchema/zodSchema";
import { useFormStore } from "../../../../store/formStore";
import type { CanvasField, FieldValidations } from "../../../../types/field";
import type { PatternRule } from "../../../../types/fieldContact";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { TwoColumnFieldGroup } from "../../../atoms/TwoColumnFieldGroup/TwoColumnFieldGroup";
import { DateBoundInput } from "../../../molecules/DateBoundInput/DateBoundInput";
import { GeneratedSchemaPreview } from "../../../molecules/GeneratedSchemaPreview/GeneratedSchemaPreview";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ValidationOverridesEditor } from "../ValidationOverridesEditor/ValidationOverridesEditor";
import {
  BASIC_RULES_DESCRIPTION,
  BUILT_IN_FORMAT_DESCRIPTION,
  DATE_BOUNDS_DESCRIPTION,
  FORMAT_DESCRIPTION,
  MAX_DIGITS_DESCRIPTION,
} from "./ValidationsPanel.constants";
import { toNumberOrUndefined } from "./ValidationsPanel.utils";

export function ValidationsPanel({ field }: { field: CanvasField }) {
  const updateFieldValidations = useFormStore((state) => state.updateFieldValidations);
  const v: FieldValidations = field.validations;
  const candidates: CanvasField[] = useDependencyCandidates(field.id);
  const isNumeric = field.type === "number" || field.type === "calculated";
  const isTextLike =
    field.type === "text" ||
    field.type === "textarea" ||
    field.type === "select" ||
    isContactField(field.type);
  // Telefono y correo ya validan sin patron: lo vacio no es "sin formato" sino "el de fabrica".
  const builtInFormat: PatternRule | undefined = builtInFormatOf(field);
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
        <PanelSection
          title="Reglas básicas"
          description={
            isNumeric
              ? `${BASIC_RULES_DESCRIPTION}\n${MAX_DIGITS_DESCRIPTION}`
              : BASIC_RULES_DESCRIPTION
          }
        >
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
          )}
        </PanelSection>
      )}

      {isDateFieldType(field.type) && (
        <PanelSection title="Fechas permitidas" description={DATE_BOUNDS_DESCRIPTION}>
          <DateBoundInput
            id="min-date"
            label="No antes de"
            bound={v.minDate}
            onChange={(minDate) => updateFieldValidations(field.id, { minDate })}
          />
          <DateBoundInput
            id="max-date"
            label="No después de"
            bound={v.maxDate}
            onChange={(maxDate) => updateFieldValidations(field.id, { maxDate })}
          />
        </PanelSection>
      )}

      {isTextLike && (
        <PanelSection
          title="Formato y mensaje"
          description={
            builtInFormat
              ? `${FORMAT_DESCRIPTION}\n${BUILT_IN_FORMAT_DESCRIPTION}`
              : FORMAT_DESCRIPTION
          }
        >
          <LabeledInput
            id="pattern"
            label="Expresión regular"
            value={v.pattern ?? ""}
            onChange={(event) => updateFieldValidations(field.id, { pattern: event.target.value })}
            placeholder={builtInFormat ? "La del tipo" : "^[0-9]+-[0-9]$"}
            tone="code"
          />

          <LabeledInput
            id="error-message"
            label="Mensaje de error"
            value={v.message ?? ""}
            onChange={(event) => updateFieldValidations(field.id, { message: event.target.value })}
            placeholder={builtInFormat?.message ?? "Formato inválido"}
          />
        </PanelSection>
      )}

      <GeneratedSchemaPreview schema={buildZodSchema(field)} />

      <ValidationOverridesEditor field={field} candidates={candidates} />
    </div>
  );
}
