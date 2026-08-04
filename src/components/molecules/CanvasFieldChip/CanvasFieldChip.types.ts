import type { MouseEvent } from "react";
import type { CanvasField } from "../../../types/field";

export interface CanvasFieldChipProps {
  field: CanvasField;
  rowId: string;
  rowColumns: number;
  rowFields: CanvasField[];
  linkedLabel: CanvasField | null;
  selected: boolean;
  onClick: () => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>) => void;
}
