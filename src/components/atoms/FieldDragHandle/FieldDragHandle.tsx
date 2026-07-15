import { GRIP_DOT_KEYS } from "./FieldDragHandle.constants";
import type { FieldDragHandleProps } from "./FieldDragHandle.types";

export function FieldDragHandle({ listeners, attributes }: FieldDragHandleProps) {
  return (
    <div
      {...listeners}
      {...attributes}
      title="Arrastrar para mover"
      className="absolute -left-2 top-1/2 z-9 flex h-9 w-4.5 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm ring-1 ring-transparent transition-all duration-150 hover:border-orange-300 hover:ring-orange-200 active:cursor-grabbing active:scale-95 active:border-orange-400 active:ring-orange-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-orange-500/60 dark:hover:ring-orange-500/20 dark:active:border-orange-500"
    >
      <span className="grid grid-cols-2 gap-0.75 opacity-40 transition-opacity group-hover:opacity-90">
        {GRIP_DOT_KEYS.map((key) => (
          <span key={key} className="h-1 w-1 rounded-full bg-slate-400 dark:bg-neutral-500" />
        ))}
      </span>
    </div>
  );
}
