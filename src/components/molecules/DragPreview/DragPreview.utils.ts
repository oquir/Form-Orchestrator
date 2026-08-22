import type { DragPreviewProps } from "./DragPreview.types";

export function getDragLabel(activeDrag: DragPreviewProps["activeDrag"]): string {
  if (activeDrag.source === "palette") return activeDrag.fieldType.label;
  if (activeDrag.source === "canvas-field") return activeDrag.field.label;

  const count: number = activeDrag.row.fields.length;

  return count === 1 ? "Fila · 1 campo" : `Fila · ${count} campos`;
}
