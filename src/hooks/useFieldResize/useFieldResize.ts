import { type PointerEvent as ReactPointerEvent, useState } from "react";
import { GRID_GAP_PX } from "./useFieldResize.constants";
import type { UseFieldResizeParams, UseFieldResizeResult } from "./useFieldResize.types";

export function useFieldResize({
  colSpan,
  rowColumns,
  maxSpan,
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
    const paddingLeft = Number.parseFloat(rowStyles.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(rowStyles.paddingRight) || 0;
    const usableWidth = rowRect.width - paddingLeft - paddingRight;
    const perColumn = (usableWidth - (rowColumns - 1) * GRID_GAP_PX) / rowColumns;
    if (perColumn <= 0) return;

    const startX = event.clientX;
    const startColSpan = colSpan;
    let lastApplied = startColSpan;

    setIsResizing(true);

    function handlePointerMove(moveEvent: PointerEvent): void {
      const deltaX = moveEvent.clientX - startX;
      const deltaCols = Math.round(deltaX / (perColumn + GRID_GAP_PX));
      const next = Math.max(1, Math.min(maxSpan, startColSpan + deltaCols));
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
