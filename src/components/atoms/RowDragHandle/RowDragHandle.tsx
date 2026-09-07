import { SortV } from "reicon-react";
import { ROW_TOOLBAR_ICON_ITEM_CLASSES } from "../../../constants/uiClasses";
import type { RowDragHandleProps } from "./RowDragHandle.types";

// Ya no se posiciona ni se muestra solo: es el primer item de la barra de la fila, y quien decide
// cuando aparece es la barra. Aca solo queda el nodo que dnd-kit escucha.
export function RowDragHandle({ listeners, attributes }: RowDragHandleProps) {
  return (
    <div
      {...listeners}
      {...attributes}
      title="Arrastrar para reordenar la fila"
      className={`${ROW_TOOLBAR_ICON_ITEM_CLASSES} cursor-grab active:cursor-grabbing active:text-brand-fg`}
    >
      <SortV size={12} />
    </div>
  );
}
