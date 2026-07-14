import type { ConditionOperatorSelectProps } from "./ConditionOperatorSelect.types";

export function ConditionOperatorSelect({
  operator,
  availableOperators,
  operatorLabels,
  onChange,
}: ConditionOperatorSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-500 dark:text-neutral-400">…y el valor</span>
      <select
        value={operator}
        onChange={(event) => onChange(event.target.value as typeof operator)}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
      >
        {availableOperators.map((op) => (
          <option key={op} value={op}>
            {operatorLabels[op]}
          </option>
        ))}
      </select>
    </div>
  );
}
