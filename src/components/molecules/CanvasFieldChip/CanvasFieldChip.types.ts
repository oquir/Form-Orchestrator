import type { MouseEvent } from "react";
import type { CanvasField } from "../../../types/storeTypes";

export interface CanvasFieldChipProps {
  field: CanvasField;
  rowColumns: number;
  selected: boolean;
  onClick: () => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>) => void;
}
