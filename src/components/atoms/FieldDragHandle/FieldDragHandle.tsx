import { Maximize22 } from "reicon-react";
import { CHROME_ON_FIELD_CLASSES, CHROME_PINNED_CLASSES } from "../../../constants/uiClasses";
import type { FieldDragHandleProps } from "./FieldDragHandle.types";

// Se oculta entera al reposo, igual que el tirador de ancho. Antes solo se atenuaba el icono, asi
// que la caja blanca quedaba pintada una vez por campo: era el peso repetido mas grande del lienzo.
// Se esconde por opacidad y no desmontandola, para no sacarle el nodo a dnd-kit a mitad de gesto.
export function FieldDragHandle({
  listeners,
  attributes,
  colSpan,
  rowColumns,
  pinned,
}: FieldDragHandleProps) {
  const isCompact = rowColumns / colSpan >= 8;

  return (
    <div
      {...listeners}
      {...attributes}
      title="Arrastrar para mover"
      className={`absolute -left-1 top-1/2 z-9 flex -translate-y-1/2 cursor-grab items-center justify-center border border-slate-200 bg-white shadow-sm ring-1 ring-transparent transition-all hover:border-orange-300 hover:ring-orange-200 active:cursor-grabbing active:scale-95 active:border-orange-400 active:ring-orange-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-orange-500/60 dark:hover:ring-orange-500/20 dark:active:border-orange-500 ${
        isCompact ? "h-6 w-6 rounded-lg" : "h-9 w-9 rounded-xl"
      } ${pinned ? CHROME_PINNED_CLASSES : CHROME_ON_FIELD_CLASSES}`}
    >
      <Maximize22 size={isCompact ? 12 : 18} className="text-slate-400 dark:text-neutral-500" />
    </div>
  );
}
