import type {
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import type { PendingOptionsField } from "../hooks/useDragAndDrop/useDragAndDrop.types";
import type { ActiveDrag } from "./activeDrag";

export interface DragAndDropReturn {
  sensors: SensorDescriptor<SensorOptions>[];
  activeDrag: ActiveDrag | null;
  pendingOptionsField: PendingOptionsField | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragMove: (event: DragMoveEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  confirmOptionsField: (config: { title?: string; optionCount: number }) => void;
  cancelOptionsField: () => void;
}
