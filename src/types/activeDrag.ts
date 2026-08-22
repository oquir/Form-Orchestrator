import type { CanvasField } from "./field";
import type { FieldTypeDef } from "./fieldTypes";
import type { CanvasRow } from "./formStructure";

export type ActiveDrag =
  | { source: "palette"; fieldType: FieldTypeDef }
  | { source: "canvas-field"; field: CanvasField }
  | { source: "canvas-row"; row: CanvasRow };
