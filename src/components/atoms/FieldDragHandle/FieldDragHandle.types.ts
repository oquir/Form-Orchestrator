import type { useDraggable } from "@dnd-kit/core";

type DraggableHandle = ReturnType<typeof useDraggable>;

export interface FieldDragHandleProps {
  listeners?: DraggableHandle["listeners"];
  attributes?: DraggableHandle["attributes"];
  colSpan: number;
  rowColumns: number;
  // Fijo, sin necesidad de hover, cuando el campo esta seleccionado.
  pinned: boolean;
}
