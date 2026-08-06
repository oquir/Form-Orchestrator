import { Xmark } from "reicon-react";
import { OPERATOR_LABELS } from "../../../constants/conditions";
import {
  operatorNeedsValue,
  operatorsForFieldType,
} from "../../../lib/fieldCondition/fieldCondition";
import { useFormStore } from "../../../store/formStore";
import type { CanvasField, ConditionOperator, FieldValidationOverride } from "../../../types/field";
import { TwoColumnFieldGroup } from "../../atoms/TwoColumnFieldGroup/TwoColumnFieldGroup";
import { ConditionFieldSelect } from "../ConditionFieldSelect/ConditionFieldSelect";
import { ConditionOperatorSelect } from "../ConditionOperatorSelect/ConditionOperatorSelect";
import { ConditionValueInput } from "../ConditionValueInput/ConditionValueInput";
import { LabeledInput } from "../LabeledInput/LabeledInput";
import { CARD_CLASSES } from "./ValidationOverrideCard.constants";
import type { ValidationOverrideCardProps } from "./ValidationOverrideCard.types";
import { toNumberOrUndefined } from "./ValidationOverrideCard.utils";

export function ValidationOverrideCard({
  field,
  override,
  candidates,
  position,
}: ValidationOverrideCardProps) {
  const updateOverride = useFormStore((state) => state.updateFieldValidationOverride);
  const removeOverride = useFormStore((state) => state.removeFieldValidationOverride);

  const observed = candidates.find((candidate) => candidate.id === override.when.fieldId);
  // El campo observado puede haber cambiado de tipo desde que se escribio la condicion, asi que
  // los operadores se recalculan en vez de confiar en el que quedo guardado.
  const availableOperators: ConditionOperator[] = observed
    ? operatorsForFieldType(observed.type)
    : operatorsForFieldType("text");

  const isNumeric = field.type === "number" || field.type === "calculated";
  const isTextLike = field.type === "text" || field.type === "textarea" || field.type === "select";

  function setRule(updates: Partial<FieldValidationOverride["validations"]>): void {
    updateOverride(field.id, override.id, { validations: updates });
  }

  return (
    <div className={CARD_CLASSES}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
          Cuando #{position}
        </span>
        <button
          type="button"
          onClick={() => removeOverride(field.id, override.id)}
          aria-label={`Quitar la validación condicional ${position}`}
          className="text-slate-400 hover:cursor-pointer hover:text-red-600 dark:text-neutral-500"
        >
          <Xmark size={12} weight="Filled" />
        </button>
      </div>

      <ConditionFieldSelect
        label="Campo observado"
        condition={override.when}
        otherFields={candidates}
        observedIsDead={override.when.fieldId !== "" && observed === undefined}
        onChange={(fieldId) => {
          const next: CanvasField | undefined = candidates.find(
            (candidate) => candidate.id === fieldId,
          );
          const operators: ConditionOperator[] = operatorsForFieldType(next?.type ?? "text");
          const operator: ConditionOperator = operators.includes(override.when.operator)
            ? override.when.operator
            : operators[0];

          updateOverride(field.id, override.id, { when: { ...override.when, fieldId, operator } });
        }}
      />

      <ConditionOperatorSelect
        operator={override.when.operator}
        availableOperators={availableOperators}
        operatorLabels={OPERATOR_LABELS}
        onChange={(operator) =>
          updateOverride(field.id, override.id, { when: { ...override.when, operator } })
        }
      />

      {operatorNeedsValue(override.when.operator) && (
        <ConditionValueInput
          condition={override.when}
          observedField={observed}
          onChange={(value) =>
            updateOverride(field.id, override.id, { when: { ...override.when, value } })
          }
        />
      )}

      <hr className="border-slate-200 dark:border-neutral-700" />

      {isTextLike && (
        <>
          <TwoColumnFieldGroup legend="Longitud">
            <LabeledInput
              id={`override-min-length-${override.id}`}
              label="Longitud mín."
              type="number"
              min={0}
              value={override.validations.minLength ?? ""}
              onChange={(event) => setRule({ minLength: toNumberOrUndefined(event.target.value) })}
            />
            <LabeledInput
              id={`override-max-length-${override.id}`}
              label="Longitud máx."
              type="number"
              min={0}
              value={override.validations.maxLength ?? ""}
              onChange={(event) => setRule({ maxLength: toNumberOrUndefined(event.target.value) })}
            />
          </TwoColumnFieldGroup>

          <LabeledInput
            id={`override-pattern-${override.id}`}
            label="Expresión regular"
            value={override.validations.pattern ?? ""}
            onChange={(event) => setRule({ pattern: event.target.value || undefined })}
            placeholder="Hereda la de arriba"
            className="font-mono"
          />

          <LabeledInput
            id={`override-message-${override.id}`}
            label="Mensaje de error"
            value={override.validations.message ?? ""}
            onChange={(event) => setRule({ message: event.target.value || undefined })}
            placeholder="Hereda el de arriba"
          />
        </>
      )}

      {isNumeric && (
        <TwoColumnFieldGroup legend="Rango de valores">
          <LabeledInput
            id={`override-min-${override.id}`}
            label="Valor mín."
            type="number"
            value={override.validations.min ?? ""}
            onChange={(event) => setRule({ min: toNumberOrUndefined(event.target.value) })}
          />
          <LabeledInput
            id={`override-max-${override.id}`}
            label="Valor máx."
            type="number"
            value={override.validations.max ?? ""}
            onChange={(event) => setRule({ max: toNumberOrUndefined(event.target.value) })}
          />
        </TwoColumnFieldGroup>
      )}
    </div>
  );
}
