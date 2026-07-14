import type { ConditionActivationToggleProps } from "./ConditionActivationToggle.types";

export function ConditionActivationToggle({
  checked,
  disabled,
  onChange,
}: ConditionActivationToggleProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-slate-600 dark:text-neutral-300">
        Habilitación condicional
      </span>
      <label className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-neutral-400">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          className="accent-orange-500"
        />
        Activar
      </label>
    </div>
  );
}
