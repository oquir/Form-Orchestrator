import { type PointerEvent as ReactPointerEvent, useState } from "react";
import { GRID_GAP_PX } from "./FieldResizeHandle.constants";
import type { FieldResizeHandleProps } from "./FieldResizeHandle.types";

export function FieldResizeHandle({ colSpan, rowColumns, onResize }: FieldResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    const rowElement = event.currentTarget.closest<HTMLElement>("[data-canvas-row]");
    if (!rowElement) return;

    const rowRect = rowElement.getBoundingClientRect();
    const rowStyles = window.getComputedStyle(rowElement);
    const paddingLeft = Number.parseFloat(rowStyles.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(rowStyles.paddingRight) || 0;
    const usableWidth = rowRect.width - paddingLeft - paddingRight;
    const perColumn = (usableWidth - (rowColumns - 1) * GRID_GAP_PX) / rowColumns;
    if (perColumn <= 0) return;

    const startX = event.clientX;
    const startColSpan = colSpan;
    let lastApplied = startColSpan;

    setIsResizing(true);

    function handlePointerMove(moveEvent: PointerEvent) {
      const deltaX = moveEvent.clientX - startX;
      const deltaCols = Math.round(deltaX / (perColumn + GRID_GAP_PX));
      const next = Math.max(1, Math.min(rowColumns, startColSpan + deltaCols));
      if (next !== lastApplied) {
        lastApplied = next;
        onResize(next);
      }
    }

    function handlePointerUp() {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      setIsResizing(false);
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      title={`Redimensionar (${colSpan}/${rowColumns})`}
      className={`absolute -right-1.5 top-1/2 flex h-9 w-3 -translate-y-1/2 cursor-col-resize items-center justify-center transition-opacity ${
        isResizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}
    >
      <span
        className={`h-full w-1.5 rounded-full shadow-sm ring-1 transition-colors ${
          isResizing
            ? "bg-orange-500 ring-orange-500"
            : "bg-slate-200 ring-slate-300/60 hover:bg-orange-400 hover:ring-orange-300 dark:bg-neutral-600 dark:ring-neutral-500/60 dark:hover:bg-orange-500"
        }`}
      />
    </div>
  );
}
