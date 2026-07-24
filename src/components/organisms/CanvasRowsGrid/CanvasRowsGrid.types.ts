import type { CanvasRow as CanvasRowData } from "../../../types/formStructure";

export interface CanvasRowsGridProps {
  rows: CanvasRowData[];
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}
