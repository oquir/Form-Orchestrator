import type { DragPreviewProps } from "./DragPreview.types";

export function getDragLabel(activeDrag: DragPreviewProps["activeDrag"]): string {
  if (activeDrag.source === "palette") return activeDrag.fieldType.label;
  if (activeDrag.source === "library") return activeDrag.component.name;
  return activeDrag.field.label;
}
