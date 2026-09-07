import type { RowStyles } from "../../../types/formStructure";

export interface RowStylesMenuProps {
  rowId: string;
  styles: RowStyles | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}
