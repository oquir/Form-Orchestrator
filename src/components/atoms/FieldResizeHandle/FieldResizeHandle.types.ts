export interface FieldResizeHandleProps {
  colSpan: number;
  rowColumns: number;
  maxSpan: number;
  pinned: boolean;
  onResize: (nextColSpan: number) => void;
}
