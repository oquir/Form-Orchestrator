import type {
  CollisionDetection,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  Modifier,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import type { ActiveDrag } from "./activeDrag";

export interface DragAndDropReturn {
  sensors: SensorDescriptor<SensorOptions>[];
  activeDrag: ActiveDrag | null;
  collisionDetection: CollisionDetection;
  overlayModifiers: Modifier[];
  handleDragStart: (event: DragStartEvent) => void;
  handleDragMove: (event: DragMoveEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}
