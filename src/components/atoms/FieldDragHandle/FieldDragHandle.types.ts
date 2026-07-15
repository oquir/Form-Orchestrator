import type { useDraggable } from "@dnd-kit/core";

type DraggableHandle = ReturnType<typeof useDraggable>;

export interface FieldDragHandleProps {
  listeners?: DraggableHandle["listeners"];
  attributes?: DraggableHandle["attributes"];
}
