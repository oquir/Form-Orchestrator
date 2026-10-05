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
          ? "scale-95 border-brand bg-brand-surface ring-brand/40"
          : `border-brand/50 bg-white ring-transparent hover:border-brand hover:ring-brand/20 dark:bg-neutral-800 ${
              pinned ? CHROME_PINNED_CLASSES : CHROME_ON_FIELD_CLASSES
            }`
      }`}
    >
      <SortH size={18} className="text-brand-fg" />
    </div>
  );
}
