import { Xmark } from "reicon-react";

interface StepTabChipProps {
  label: string;
  active: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  removeTitle?: string;
  removeIconSize?: number;
  className?: string;
}

export function StepTabChip({
  label,
  active,
  onSelect,
  onRemove,
  removeTitle,
  removeIconSize = 12,
  className = "",
}: StepTabChipProps) {
  return (
    <div
      className={`group flex items-center gap-1 rounded-md pl-2.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:text-white dark:hover:bg-orange-400"
          : "text-slate-500 hover:bg-slate-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
      } ${className}`}
    >
      <button type="button" onClick={onSelect} className="select-none hover:cursor-pointer">
        {label}
      </button>

      {onRemove && (
        <button
          type="button"
          title={removeTitle}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-full px-px py-px opacity-60 hover:bg-red-500 hover:text-white hover:opacity-100 hover:cursor-pointer"
        >
          <Xmark size={removeIconSize} weight="Filled" />
        </button>
      )}
    </div>
  );
}
