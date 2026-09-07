import { SortH } from "reicon-react";
import { CHROME_ON_FIELD_CLASSES, CHROME_PINNED_CLASSES } from "../../../constants/uiClasses";
import type { FieldResizeHandleVariantProps } from "../../../types/fieldResize";

export function FieldResizeHandleKnob({
  isResizing,
  title,
  pinned,
  onPointerDown,
}: FieldResizeHandleVariantProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      title={title}
      className={`absolute -right-1 top-1/2 z-9 flex h-9 w-9 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-xl border shadow-sm ring-1 transition-all ${
        isResizing
          ? "scale-95 border-orange-400 bg-orange-50 ring-orange-300 dark:border-orange-500 dark:bg-orange-950/40 dark:ring-orange-500/40"
          : `border-orange-300 bg-white ring-transparent hover:border-orange-400 hover:ring-orange-200 dark:border-orange-500/60 dark:bg-neutral-800 dark:hover:border-orange-500 dark:hover:ring-orange-500/20 ${
              pinned ? CHROME_PINNED_CLASSES : CHROME_ON_FIELD_CLASSES
            }`
      }`}
    >
      <SortH size={18} className="text-orange-500 dark:text-orange-400" />
    </div>
  );
}
