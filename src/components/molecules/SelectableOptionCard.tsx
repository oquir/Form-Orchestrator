interface SelectableOptionCardProps {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

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
          ? "border-slate-900 ring-1 ring-slate-900 dark:border-slate-100 dark:ring-slate-100"
          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
      }`}
    >
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
    </button>
  );
}
