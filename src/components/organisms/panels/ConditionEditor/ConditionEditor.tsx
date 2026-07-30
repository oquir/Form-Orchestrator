import { useConditionEditor } from "../../../../hooks/useConditionEditor/useConditionEditor";
import { ConditionActivationToggle } from "../../../molecules/ConditionActivationToggle/ConditionActivationToggle";
import { ConditionFieldSelect } from "../../../molecules/ConditionFieldSelect/ConditionFieldSelect";
import { ConditionOperatorSelect } from "../../../molecules/ConditionOperatorSelect/ConditionOperatorSelect";
import { ConditionValueInput } from "../../../molecules/ConditionValueInput/ConditionValueInput";
import { CONDITION_COPY, OPERATOR_LABELS } from "./ConditionEditor.constants";
import type { ConditionEditorProps } from "./ConditionEditor.types";

export function ConditionEditor({ field, otherFields, kind }: ConditionEditorProps) {
  const {
    condition,
    observed,
    observedIsDead,
    availableOperators,
    needsValue,
    updateCondition,
    handleActivationChange,
    handleObservedFieldChange,
    handleOperatorChange,
  } = useConditionEditor({ field, otherFields, kind });

  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
      <ConditionActivationToggle
        label={CONDITION_COPY[kind].label}
        checked={Boolean(condition)}
        disabled={otherFields.length === 0}
        onChange={handleActivationChange}
      />

      {otherFields.length === 0 && !condition && (
        <p className="text-[11px] text-slate-400 dark:text-neutral-500">
          {CONDITION_COPY[kind].emptyHint}
        </p>
      )}

      {condition && (
        <>
          <ConditionFieldSelect
            label={CONDITION_COPY[kind].fieldLabel}
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
