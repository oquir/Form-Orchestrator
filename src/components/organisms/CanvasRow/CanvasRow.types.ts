import type { CanvasRow } from "../../../types/storeTypes";

export interface CanvasRowProps {
  row: CanvasRow;
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}
