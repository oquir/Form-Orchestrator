import type { FieldTypeDef } from "./fieldTypes";
import type { CanvasField, SavedComponent } from "./storeTypes";

export type ActiveDrag =
  | { source: "palette"; fieldType: FieldTypeDef }
  | { source: "library"; component: SavedComponent }
  | { source: "canvas-field"; field: CanvasField };
