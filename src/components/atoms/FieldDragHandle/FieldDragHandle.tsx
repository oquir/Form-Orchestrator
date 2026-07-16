import { Maximize22 } from "reicon-react";
import type { FieldDragHandleProps } from "./FieldDragHandle.types";

export function FieldDragHandle({
  listeners,
  attributes,
  colSpan,
  rowColumns,
}: FieldDragHandleProps) {
  const isCompact = rowColumns / colSpan >= 8;

  return (
    <div
      {...listeners}
      {...attributes}
      title="Arrastrar para mover"
      className={`absolute top-1/2 z-9 flex -translate-y-1/2 cursor-grab items-center justify-center border border-slate-200 bg-white shadow-sm ring-1 ring-transparent transition-all duration-150 hover:border-orange-300 hover:ring-orange-200 active:cursor-grabbing active:scale-95 active:border-orange-400 active:ring-orange-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-orange-500/60 dark:hover:ring-orange-500/20 dark:active:border-orange-500 ${
        isCompact ? "-left-1 h-6 w-6 rounded-lg" : "-left-2 h-9 w-9 rounded-xl"
      }`}
    >
      <Maximize22
        size={isCompact ? 12 : 18}
        className="text-slate-400 opacity-40 transition-opacity group-hover:opacity-90 dark:text-neutral-500"
      />
    </div>
  );
}
