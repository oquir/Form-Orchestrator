import type { CanvasField } from "../../../types/field";
import type { CanvasRow } from "../../../types/formStructure";

export interface CanvasRowProps {
  row: CanvasRow;
  // Indexado por el id del campo al que la etiqueta apunta, no por el de la etiqueta.
  linkedLabels: Map<string, CanvasField>;
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}
