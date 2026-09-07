import type { useDraggable } from "@dnd-kit/core";
import type { CanvasRow } from "../../../types/formStructure";

type DraggableHandle = ReturnType<typeof useDraggable>;

export type RowToolbarMenu = "columns" | "styles";

export interface RowToolbarProps {
  row: CanvasRow;
  listeners?: DraggableHandle["listeners"];
  attributes?: DraggableHandle["attributes"];
  // Fija sin hover cuando la fila contiene el campo seleccionado.
  pinned: boolean;
}
