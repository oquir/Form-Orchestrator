import type { CanvasRow as CanvasRowData, RepeatableGroup } from "../../../types/formStructure";

export interface CanvasRowsGridProps {
  rows: CanvasRowData[];
  groups?: RepeatableGroup[];
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}

export type CanvasBlock =
  | { kind: "row"; row: CanvasRowData }
  | { kind: "group"; groupId: string; rows: CanvasRowData[] };

// Cuanto se aparta cada cosa, en px. Van separados porque una banda se mueve entera, como un
// bloque, mientras que reordenar dentro de un grupo mueve sus filas una por una.
export interface RowDisplacement {
  rows: Map<string, number>;
  bands: Map<string, number>;
}
