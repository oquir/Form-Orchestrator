import type { FieldTypeDef } from "./fieldTypes";
import type { SavedComponent } from "./storeTypes";

export type ActiveDrag =
  | { source: "palette"; fieldType: FieldTypeDef }
  | { source: "library"; component: SavedComponent };
