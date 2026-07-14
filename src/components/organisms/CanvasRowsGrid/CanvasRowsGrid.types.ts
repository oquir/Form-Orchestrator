import type { CanvasRow as CanvasRowData } from "../../../types/storeTypes";

export interface CanvasRowsGridProps {
  rows: CanvasRowData[];
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}
