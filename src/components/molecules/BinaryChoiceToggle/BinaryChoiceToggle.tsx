import type { BinaryChoiceToggleProps } from "./BinaryChoiceToggle.types";

export function BinaryChoiceToggle({
  value,
  onChange,
  yesLabel = "Sí",
  noLabel = "No",
}: BinaryChoiceToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:cursor-pointer ${
          value === true
            ? "border-brand bg-brand text-on-brand"
            : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
        }`}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:cursor-pointer ${
          value === false
            ? "border-brand bg-brand text-on-brand"
            : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
        }`}
      >
        {noLabel}
      </button>
    </div>
  );
}
