import type { ContextMenuTab } from "../../components/organisms/FieldContextMenu/FieldContextMenu.types";
import type { FieldContextMenuState } from "../../types/fieldContextMenu";
import type { CanvasField } from "../../types/storeTypes";

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
