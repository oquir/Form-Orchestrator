import type { ConditionFieldSelectProps } from "./ConditionFieldSelect.types";

export function ConditionFieldSelect({
  condition,
  otherFields,
  observedIsDead,
  onChange,
}: ConditionFieldSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-500 dark:text-neutral-400">
        Se habilita cuando el campo…
      </span>
      <select
        value={condition.fieldId}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
      >
        {observedIsDead && <option value={condition.fieldId}>(Campo eliminado — reasignar)</option>}
        {otherFields.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.label} ({candidate.type})
          </option>
        ))}
      </select>
    </div>
  );
}
