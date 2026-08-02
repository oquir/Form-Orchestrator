import { useDraggable } from "@dnd-kit/core";
import type { FieldTypeDef } from "../../../types/fieldTypes";
import { FIELD_TYPE_ICONS } from "./PaletteChip.constants";

export function PaletteChip({ fieldType }: { fieldType: FieldTypeDef }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${fieldType.type}`,
    data: { source: "palette", fieldType },
  });

  const Icon = FIELD_TYPE_ICONS[fieldType.type];

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex h-full min-h-18 w-full cursor-grab flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-3 text-center text-[11px] font-medium leading-tight text-slate-600 transition-colors hover:border-slate-300 hover:bg-white active:cursor-grabbing dark:border-neutral-700/70 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/70 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {Icon && <Icon size={20} className="text-slate-400 dark:text-neutral-400" />}
      <span>{fieldType.label}</span>
    </button>
  );
}
