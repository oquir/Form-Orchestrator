import { useFormStore } from "../../../../store/formStore";
import type { EnableCondition, EnableOperator } from "../../../../types/storeTypes";
import { ConditionActivationToggle } from "../../../molecules/ConditionActivationToggle/ConditionActivationToggle";
import { ConditionFieldSelect } from "../../../molecules/ConditionFieldSelect/ConditionFieldSelect";
import { ConditionOperatorSelect } from "../../../molecules/ConditionOperatorSelect/ConditionOperatorSelect";
import { ConditionValueInput } from "../../../molecules/ConditionValueInput/ConditionValueInput";
import { OPERATOR_LABELS, OPERATORS_WITHOUT_VALUE } from "./ConditionEditor.constants";
import type { ConditionEditorProps } from "./ConditionEditor.types";
import { operatorsForFieldType, wouldCreateCycle } from "./ConditionEditor.utils";

export function ConditionEditor({ field, otherFields }: ConditionEditorProps) {
  const setFieldEnableWhen = useFormStore((state) => state.setFieldEnableWhen);
  const condition = field.enableWhen;
  const observed = condition ? otherFields.find((f) => f.id === condition.fieldId) : null;
  const observedIsDead = Boolean(condition && !observed);
  const availableOperators = observed
    ? operatorsForFieldType(observed.type)
    : (["equals", "notEquals", "isEmpty", "isNotEmpty"] as EnableOperator[]);
  const needsValue = condition && !OPERATORS_WITHOUT_VALUE.includes(condition.operator);

  function updateCondition(next: Partial<EnableCondition>): void {
    if (!condition) return;
    setFieldEnableWhen(field.id, { ...condition, ...next });
  }

  function setConditionOnField(targetFieldId: string): void {
    const nextField = otherFields.find((f) => f.id === targetFieldId);
    if (!nextField) return;
    const ops = operatorsForFieldType(nextField.type);
    setFieldEnableWhen(field.id, {
      fieldId: nextField.id,
      operator: ops[0],
      value: OPERATORS_WITHOUT_VALUE.includes(ops[0]) ? undefined : "",
    });
  }

  function handleActivationChange(checked: boolean): void {
    if (!checked) {
      setFieldEnableWhen(field.id, null);
      return;
    }
    const firstCandidate = otherFields[0];
    if (!firstCandidate) return;
    setConditionOnField(firstCandidate.id);
  }

  function handleObservedFieldChange(nextFieldId: string): void {
    if (wouldCreateCycle(field.id, nextFieldId, otherFields)) {
      window.alert("Esa condición generaría un ciclo entre campos.");
      return;
    }
    setConditionOnField(nextFieldId);
  }

  function handleOperatorChange(nextOp: EnableOperator): void {
    updateCondition({
      operator: nextOp,
      value: OPERATORS_WITHOUT_VALUE.includes(nextOp) ? undefined : condition?.value,
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
      <ConditionActivationToggle
        checked={Boolean(condition)}
        disabled={otherFields.length === 0}
        onChange={handleActivationChange}
      />

      {otherFields.length === 0 && !condition && (
        <p className="text-[11px] text-slate-400 dark:text-neutral-500">
          Agregá otros campos al lienzo para poder condicionar este.
        </p>
      )}

      {condition && (
        <>
          <ConditionFieldSelect
            condition={condition}
            otherFields={otherFields}
            observedIsDead={observedIsDead}
            onChange={handleObservedFieldChange}
          />

          <ConditionOperatorSelect
            operator={condition.operator}
            availableOperators={availableOperators}
            operatorLabels={OPERATOR_LABELS}
            onChange={handleOperatorChange}
          />

          {needsValue && (
            <ConditionValueInput
              condition={condition}
              observedField={observed}
              onChange={(value) => updateCondition({ value })}
            />
          )}

          {observedIsDead && (
            <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
              El campo referenciado ya no existe. Reasigná o desactivá la condición.
            </p>
          )}
        </>
      )}
    </div>
  );
}
