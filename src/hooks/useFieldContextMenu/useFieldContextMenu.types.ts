import type { CanvasField } from "../../types/field";
import type { ContextMenuTab, FieldContextMenuState } from "../../types/fieldContextMenu";

export interface UseFieldContextMenuParams {
  menu: FieldContextMenuState;
  onClose: () => void;
}

export interface FieldContextMenuPosition {
  left: number;
  // Uno de los dos, segun hacia donde abra: hacia arriba se ancla por el borde inferior.
  top: number | undefined;
  bottom: number | undefined;
  width: number;
  maxHeight: number;
}

export interface UseFieldContextMenuResult {
  field: CanvasField | null;
  activeTab: ContextMenuTab;
  handleSelectTab: (tab: ContextMenuTab) => void;
  handleDelete: () => void;
  position: FieldContextMenuPosition;
}
