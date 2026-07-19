import { type PointerEvent as ReactPointerEvent, useState } from "react";
import { GRID_GAP_PX } from "./useFieldResize.constants";
import type { UseFieldResizeParams, UseFieldResizeResult } from "./useFieldResize.types";

export function useFieldResize({
  colSpan,
  rowColumns,
  onResize,
}: UseFieldResizeParams): UseFieldResizeResult {
  const [isResizing, setIsResizing] = useState<boolean>(false);

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>): void {
    event.preventDefault();
    event.stopPropagation();

    const rowElement = event.currentTarget.closest<HTMLElement>("[data-canvas-row]");
    if (!rowElement) return;

    const rowRect: DOMRect = rowElement.getBoundingClientRect();
    const rowStyles: CSSStyleDeclaration = window.getComputedStyle(rowElement);
    const paddingLeft: number = Number.parseFloat(rowStyles.paddingLeft) || 0;
    const paddingRight: number = Number.parseFloat(rowStyles.paddingRight) || 0;
    const usableWidth: number = rowRect.width - paddingLeft - paddingRight;
    const perColumn: number = (usableWidth - (rowColumns - 1) * GRID_GAP_PX) / rowColumns;
    if (perColumn <= 0) return;

    const startX: number = event.clientX;
    const startColSpan: number = colSpan;
    let lastApplied: number = startColSpan;

    setIsResizing(true);

    function handlePointerMove(moveEvent: PointerEvent): void {
      const deltaX: number = moveEvent.clientX - startX;
      const deltaCols: number = Math.round(deltaX / (perColumn + GRID_GAP_PX));
      const next: number = Math.max(1, Math.min(rowColumns, startColSpan + deltaCols));
      if (next !== lastApplied) {
        lastApplied = next;
        onResize(next);
      }
    }

    function handlePointerUp(): void {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      setIsResizing(false);
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  }

  return { isResizing, handlePointerDown };
}
