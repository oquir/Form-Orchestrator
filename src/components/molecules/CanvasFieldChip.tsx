import type { MouseEvent } from "react";
import type { CanvasField } from "../../store/formStore";
import { FieldTypeBadge } from "../atoms/FieldTypeBadge";

interface CanvasFieldChipProps {
  field: CanvasField;
  selected: boolean;
  onClick: () => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function CanvasFieldChip({ field, selected, onClick, onContextMenu }: CanvasFieldChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{
        gridColumn: `span ${field.colSpan} / span ${field.colSpan}`,
        marginTop: field.styles.marginTop,
        marginBottom: field.styles.marginBottom,
        backgroundColor: field.styles.backgroundColor,
        color: field.styles.textColor,
      }}
      className={`rounded-md border bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition-colors dark:bg-neutral-800 dark:text-neutral-200 ${
        selected
          ? "border-orange-600 ring-1 ring-orange-600 dark:border-orange-500 dark:ring-orange-500"
          : "border-slate-200 hover:border-slate-300 dark:border-neutral-700 dark:hover:border-neutral-600"
      } ${field.styles.customClasses ?? ""}`}
    >
      <FieldTypeBadge type={field.type} />
      <p>{field.label}</p>
    </button>
  );
}
