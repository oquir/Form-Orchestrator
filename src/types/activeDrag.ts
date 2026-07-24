import type { CanvasField, SavedComponent } from "./field";
import type { FieldTypeDef } from "./fieldTypes";

export type ActiveDrag =
  | { source: "palette"; fieldType: FieldTypeDef }
  | { source: "library"; component: SavedComponent }
  | { source: "canvas-field"; field: CanvasField };
