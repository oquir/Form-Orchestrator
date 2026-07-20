import type { PointerEvent as ReactPointerEvent } from "react";

export interface UseFieldResizeParams {
  colSpan: number;
  rowColumns: number;
  maxSpan: number;
  onResize: (nextColSpan: number) => void;
}

export interface UseFieldResizeResult {
  isResizing: boolean;
  handlePointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}
