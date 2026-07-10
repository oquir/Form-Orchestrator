interface BinaryChoiceToggleProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}

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
            ? "border-orange-600 bg-orange-600 text-white dark:border-orange-500 dark:bg-orange-500 dark:text-white"
            : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
        }`}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:cursor-pointer ${
          value === false
            ? "border-orange-600 bg-orange-600 text-white dark:border-orange-500 dark:bg-orange-500 dark:text-white"
            : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
        }`}
      >
        {noLabel}
      </button>
    </div>
  );
}
