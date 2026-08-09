import type { useDraggable } from "@dnd-kit/core";

type DraggableHandle = ReturnType<typeof useDraggable>;

export interface RowDragHandleProps {
  listeners?: DraggableHandle["listeners"];
  attributes?: DraggableHandle["attributes"];
}
