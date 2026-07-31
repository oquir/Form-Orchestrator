import { useMemo } from "react";
import { operatorNeedsValue, operatorsForFieldType } from "../../lib/fieldCondition/fieldCondition";
import { buildFieldGraph, describeCycle, wouldCreateCycle } from "../../lib/fieldGraph/fieldGraph";
import { useFormStore } from "../../store/formStore";
import type { CanvasField, ConditionOperator, FieldCondition } from "../../types/field";
import type { FieldGraph } from "../../types/fieldGraph";
import { DEFAULT_OPERATORS } from "./useConditionEditor.constants";
import type {
  UseConditionEditorParams,
  UseConditionEditorResult,
} from "./useConditionEditor.types";

export function useConditionEditor({
  field,
  otherFields,
  kind,
}: UseConditionEditorParams): UseConditionEditorResult {
  const setFieldEnableWhen = useFormStore((state) => state.setFieldEnableWhen);
  const setFieldVisibleWhen = useFormStore((state) => state.setFieldVisibleWhen);
  const setCondition = kind === "visible" ? setFieldVisibleWhen : setFieldEnableWhen;
  const condition = kind === "visible" ? field.visibleWhen : field.enableWhen;
  const observed = condition ? (otherFields.find((f) => f.id === condition.fieldId) ?? null) : null;
  const observedIsDead = Boolean(condition && !observed);
  const availableOperators: ConditionOperator[] = observed
    ? operatorsForFieldType(observed.type)
    : DEFAULT_OPERATORS;
  const needsValue = Boolean(condition && operatorNeedsValue(condition.operator));
  const graph: FieldGraph = useMemo(() => {
    const allFields: CanvasField[] = [field, ...otherFields];
    return buildFieldGraph(allFields);
  }, [field, otherFields]);

  function updateCondition(next: Partial<FieldCondition>): void {
    if (!condition) return;
    setCondition(field.id, { ...condition, ...next });
  }

  function setConditionOnField(targetFieldId: string): void {
    const nextField = otherFields.find((f) => f.id === targetFieldId);

    if (!nextField) return;

    const ops: ConditionOperator[] = operatorsForFieldType(nextField.type);

    setCondition(field.id, {
      fieldId: nextField.id,
      operator: ops[0],
      value: operatorNeedsValue(ops[0]) ? "" : undefined,
    });
  }

  function handleActivationChange(checked: boolean): void {
    if (!checked) {
      setCondition(field.id, null);
      return;
    }

    const firstCandidate = otherFields[0];

    if (!firstCandidate) return;

    setConditionOnField(firstCandidate.id);
  }

  function handleObservedFieldChange(nextFieldId: string): void {
    if (wouldCreateCycle(graph, field.id, nextFieldId)) {
      const chain: string = describeCycle(graph, [field.id, nextFieldId]);
      window.alert(`Esa condición generaría un ciclo entre campos (${chain}).`);
      return;
    }

    setConditionOnField(nextFieldId);
  }

  function handleOperatorChange(nextOp: ConditionOperator): void {
    updateCondition({
      operator: nextOp,
      value: operatorNeedsValue(nextOp) ? condition?.value : undefined,
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
