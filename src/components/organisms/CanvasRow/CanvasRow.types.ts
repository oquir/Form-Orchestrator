import type { CanvasRow } from "../../../types/formStructure";

export interface CanvasRowProps {
  row: CanvasRow;
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}
