import type { DragPreviewProps } from "./DragPreview.types";

function getDragLabel(activeDrag: DragPreviewProps["activeDrag"]): string {
  if (activeDrag.source === "palette") return activeDrag.fieldType.label;
  if (activeDrag.source === "library") return activeDrag.component.name;
  return activeDrag.field.label;
}

export function DragPreview({ activeDrag }: DragPreviewProps) {
  return (
    <div className="rounded-md border border-orange-500 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-lg dark:bg-neutral-800 dark:text-neutral-200">
      {getDragLabel(activeDrag)}
    </div>
  );
}
