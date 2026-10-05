import type { SelectableOptionCardProps } from "./SelectableOptionCard.types";

export function SelectableOptionCard({
  label,
  description,
  selected,
  onClick,
}: SelectableOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-left transition-colors hover:cursor-pointer ${
        selected
          ? "border-brand ring-1 ring-brand"
          : "border-slate-200 hover:border-slate-300 dark:border-neutral-700 dark:hover:border-neutral-600"
      }`}
    >
      <p className="text-sm font-medium text-slate-800 dark:text-neutral-100">{label}</p>
      <p className="text-xs text-slate-400 dark:text-neutral-500">{description}</p>
    </button>
  );
}
