import { useFormStore } from "../../store/formStore";
import type { EnableCondition, EnableOperator } from "../../types/storeTypes";
import { DEFAULT_OPERATORS, OPERATORS_WITHOUT_VALUE } from "./useConditionEditor.constants";
import type {
  UseConditionEditorParams,
  UseConditionEditorResult,
} from "./useConditionEditor.types";
import { operatorsForFieldType, wouldCreateCycle } from "./useConditionEditor.utils";

export function useConditionEditor({
  field,
  otherFields,
}: UseConditionEditorParams): UseConditionEditorResult {
  const setFieldEnableWhen = useFormStore((state) => state.setFieldEnableWhen);
  const condition = field.enableWhen;
  const observed = condition ? (otherFields.find((f) => f.id === condition.fieldId) ?? null) : null;
  const observedIsDead = Boolean(condition && !observed);
  const availableOperators: EnableOperator[] = observed
    ? operatorsForFieldType(observed.type)
    : DEFAULT_OPERATORS;
  const needsValue = Boolean(condition && !OPERATORS_WITHOUT_VALUE.includes(condition.operator));

  function updateCondition(next: Partial<EnableCondition>): void {
    if (!condition) return;
    setFieldEnableWhen(field.id, { ...condition, ...next });
  }

  function setConditionOnField(targetFieldId: string): void {
    const nextField = otherFields.find((f) => f.id === targetFieldId);

    if (!nextField) return;

    const ops: EnableOperator[] = operatorsForFieldType(nextField.type);

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

  return {
    condition,
    observed,
    observedIsDead,
    availableOperators,
    needsValue,
    updateCondition,
    handleActivationChange,
    handleObservedFieldChange,
    handleOperatorChange,
  };
}
