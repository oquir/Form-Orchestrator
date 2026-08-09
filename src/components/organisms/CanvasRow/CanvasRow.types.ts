import type { CanvasField } from "../../../types/field";
import type { CanvasRow } from "../../../types/formStructure";

export interface CanvasRowProps {
  row: CanvasRow;
  // Indexado por el id del campo al que la etiqueta apunta, no por el de la etiqueta.
  linkedLabels: Map<string, CanvasField>;
  // Cuanto se aparta esta fila, en px, para dejar pasar a la que se esta arrastrando.
  offsetY?: number;
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}
