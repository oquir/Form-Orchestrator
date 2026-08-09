import type { CanvasField } from "../../../types/field";
import type { CanvasRow, RepeatableGroup } from "../../../types/formStructure";

export interface RepeatableGroupBandProps {
  group: RepeatableGroup;
  rows: CanvasRow[];
  linkedLabels: Map<string, CanvasField>;
  // La banda se aparta entera cuando pasa una fila suelta; rowOffsets solo tiene algo cuando se
  // reordena dentro del grupo, que es el unico caso en que sus filas se mueven por separado.
  offsetY?: number;
  rowOffsets?: Map<string, number>;
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}
