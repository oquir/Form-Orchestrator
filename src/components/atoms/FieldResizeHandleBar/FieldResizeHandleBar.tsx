import type { FieldResizeHandleVariantProps } from "../../../types/fieldResize";

export function FieldResizeHandleBar({
  isResizing,
  title,
  onPointerDown,
}: FieldResizeHandleVariantProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      title={title}
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
