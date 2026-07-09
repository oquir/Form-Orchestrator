import { useDraggable } from "@dnd-kit/core";
import type { FieldTypeDef } from "../../lib/fieldTypes";

export function PaletteChip({ fieldType }: { fieldType: FieldTypeDef }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${fieldType.type}`,
    data: { source: "palette", fieldType },
  });

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-white active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {fieldType.label}
    </button>
  );
}
