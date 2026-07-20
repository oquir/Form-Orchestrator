export interface FieldResizeHandleProps {
  colSpan: number;
  rowColumns: number;
  maxSpan: number;
  onResize: (nextColSpan: number) => void;
}
