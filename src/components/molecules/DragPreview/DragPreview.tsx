import { useFormStore } from "../../../store/formStore";
import { RowDragPreview } from "../RowDragPreview/RowDragPreview";
import type { DragPreviewProps } from "./DragPreview.types";
import { getDragLabel } from "./DragPreview.utils";

export function DragPreview({ activeDrag }: DragPreviewProps) {
  const rowDrag = useFormStore((state) => state.rowDrag);
  const canvasZoom = useFormStore((state) => state.canvasZoom);
  const hoveredTransferTarget = useFormStore((state) => state.hoveredTransferTarget);

  // Sobre una pestana la fila se encoge a la ficha: dibujada a tamano real tapa la tira entera de
  // pestanas y no se ve cual esta resaltada, que es justo lo que hay que mirar ahi.
  if (activeDrag.source === "canvas-row" && rowDrag && !hoveredTransferTarget) {
    return <RowDragPreview row={activeDrag.row} width={rowDrag.width} scale={canvasZoom} />;
  }

  return (
    <div className="whitespace-nowrap rounded-md border border-orange-500 bg-white px-3 py-2 text-center text-xs font-medium text-slate-600 shadow-lg dark:bg-neutral-800 dark:text-neutral-200">
      {getDragLabel(activeDrag)}
    </div>
  );
}
