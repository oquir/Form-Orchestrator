import type { DragPreviewProps } from "./DragPreview.types";

export function DragPreview({ activeDrag }: DragPreviewProps) {
  return (
    <div className="rounded-md border border-orange-500 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-lg dark:bg-neutral-800 dark:text-neutral-200">
      {activeDrag.source === "palette" ? activeDrag.fieldType.label : activeDrag.component.name}
    </div>
  );
}
