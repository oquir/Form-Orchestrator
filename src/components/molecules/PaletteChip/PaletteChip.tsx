import { useDraggable } from "@dnd-kit/core";
import type { FieldTypeDef } from "../../../types/fieldTypes";

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
      className={`cursor-grab rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-white active:cursor-grabbing dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 w-full ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {fieldType.label}
    </button>
  );
}
