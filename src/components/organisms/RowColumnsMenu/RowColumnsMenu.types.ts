export interface RowColumnsMenuProps {
  rowId: string;
  columns: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}
