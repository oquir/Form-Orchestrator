import type { MouseEvent } from "react";
import type { CanvasField } from "../../../types/field";

export interface CanvasFieldChipProps {
  field: CanvasField;
  rowId: string;
  rowColumns: number;
  rowFields: CanvasField[];
  linkedLabel: CanvasField | null;
  selected: boolean;
  // Cromo fijo sin hover: solo el campo de una seleccion unica con la herramienta de mover.
  pinned: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>) => void;
}
