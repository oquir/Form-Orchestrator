import type { CanvasField, SavedComponent } from "./field";
import type { FieldTypeDef } from "./fieldTypes";
import type { CanvasRow } from "./formStructure";

export type ActiveDrag =
  | { source: "palette"; fieldType: FieldTypeDef }
  | { source: "library"; component: SavedComponent }
  | { source: "canvas-field"; field: CanvasField }
  | { source: "canvas-row"; row: CanvasRow };
