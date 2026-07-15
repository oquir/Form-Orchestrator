export interface FieldResizeHandleProps {
  colSpan: number;
  rowColumns: number;
  onResize: (nextColSpan: number) => void;
}
