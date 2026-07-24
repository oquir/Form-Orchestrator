export type CanvasTarget =
  | { type: "formStep"; stepId: string }
  | { type: "introStep"; stepId: string };

export type PlacementMode = "move" | "resize";

export interface FieldPlacement {
  colStart: number;
  colSpan: number;
}

export interface DragPlacement extends FieldPlacement {
  rowId: string;
  mode: PlacementMode;
  isValid: boolean;
}
