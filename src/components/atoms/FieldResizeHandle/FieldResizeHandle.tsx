import { SortH } from "reicon-react";
import { useFieldResize } from "../../../hooks/useFieldResize/useFieldResize";
import type { FieldResizeHandleProps } from "./FieldResizeHandle.types";

export function FieldResizeHandle({
  colSpan,
  rowColumns,
  maxSpan,
  onResize,
}: FieldResizeHandleProps) {
  const { isResizing, handlePointerDown } = useFieldResize({
    colSpan,
    rowColumns,
    maxSpan,
    onResize,
  });
  const isCompact: boolean = rowColumns / colSpan >= 8;

  if (isCompact) {
    return (
      <div
        onPointerDown={handlePointerDown}
        title={`Redimensionar (${colSpan}/${rowColumns})`}
        className={`absolute -right-1 top-1/2 z-9 flex h-9 w-3 -translate-y-1/2 cursor-col-resize items-center justify-center transition-opacity ${
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

  return (
    <div
      onPointerDown={handlePointerDown}
      title={`Redimensionar (${colSpan}/${rowColumns})`}
      className={`absolute -right-1 top-1/2 z-9 flex h-9 w-9 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-xl border shadow-sm ring-1 transition-all duration-150 ${
        isResizing
          ? "scale-95 border-orange-400 bg-orange-50 ring-orange-300 dark:border-orange-500 dark:bg-orange-950/40 dark:ring-orange-500/40"
          : "border-orange-300 bg-white opacity-0 ring-transparent group-hover:opacity-100 hover:border-orange-400 hover:ring-orange-200 dark:border-orange-500/60 dark:bg-neutral-800 dark:hover:border-orange-500 dark:hover:ring-orange-500/20"
      }`}
    >
      <SortH size={18} className="text-orange-500 dark:text-orange-400" />
    </div>
  );
}
