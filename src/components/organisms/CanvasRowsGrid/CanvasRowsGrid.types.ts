import type { CanvasRow as CanvasRowData, RepeatableGroup } from "../../../types/formStructure";

export interface CanvasRowsGridProps {
  rows: CanvasRowData[];
  groups?: RepeatableGroup[];
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}

export type CanvasBlock =
  | { kind: "row"; row: CanvasRowData }
  | { kind: "group"; groupId: string; rows: CanvasRowData[] };
