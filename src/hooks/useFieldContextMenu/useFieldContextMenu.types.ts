import type { CanvasField } from "../../types/field";
import type { ContextMenuTab, FieldContextMenuState } from "../../types/fieldContextMenu";

export interface UseFieldContextMenuParams {
  menu: FieldContextMenuState;
  onClose: () => void;
}

export interface FieldContextMenuPosition {
  left: number;
  top: number;
  width: number;
}

export interface UseFieldContextMenuResult {
  field: CanvasField | null;
  activeTab: ContextMenuTab;
  handleSelectTab: (tab: ContextMenuTab) => void;
  handleDelete: () => void;
  position: FieldContextMenuPosition;
}
