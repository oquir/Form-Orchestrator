import { type PointerEvent as ReactPointerEvent, useState } from "react";
import { SortH } from "reicon-react";
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
      className={`absolute -right-2 top-1/2 z-9 flex h-9 w-9 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-xl border shadow-sm ring-1 transition-all duration-150 ${
        isResizing
          ? "scale-95 border-orange-400 bg-orange-50 ring-orange-300 dark:border-orange-500 dark:bg-orange-950/40 dark:ring-orange-500/40"
          : "border-orange-300 bg-white opacity-0 ring-transparent group-hover:opacity-100 hover:border-orange-400 hover:ring-orange-200 dark:border-orange-500/60 dark:bg-neutral-800 dark:hover:border-orange-500 dark:hover:ring-orange-500/20"
      }`}
    >
      <SortH size={18} className="text-orange-500 dark:text-orange-400" />
    </div>
  );
}
