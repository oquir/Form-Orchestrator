import { SortV } from "reicon-react";
import type { RowDragHandleProps } from "./RowDragHandle.types";

// group-hover/row y no group-hover a secas: la fila es antecesora de los chips, y un `group` sin
// nombre aqui haria aparecer tambien el tirador de cada campo al pasar por encima de la fila.
export function RowDragHandle({ listeners, attributes }: RowDragHandleProps) {
  return (
    <div
      {...listeners}
      {...attributes}
      title="Arrastrar para reordenar la fila"
      className="absolute -left-3 top-1/2 z-9 flex h-8 w-5 -translate-y-1/2 cursor-grab items-center justify-center rounded-md border border-slate-200 bg-white opacity-0 shadow-sm transition-all group-hover/row:opacity-100 hover:border-orange-300 active:scale-95 active:cursor-grabbing active:border-orange-400 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-orange-500/60"
    >
      <SortV size={12} className="text-slate-400 dark:text-neutral-500" />
    </div>
  );
}
