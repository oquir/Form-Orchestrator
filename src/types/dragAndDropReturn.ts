import type {
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import type { ActiveDrag } from "./activeDrag";

export interface DragAndDropReturn {
  sensors: SensorDescriptor<SensorOptions>[];
  activeDrag: ActiveDrag | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragMove: (event: DragMoveEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}
