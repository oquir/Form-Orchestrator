import { useDraggable } from "@dnd-kit/core";
import type { SavedComponent } from "../../store/formStore";
import { useFormStore } from "../../store/formStore";
import { FieldTypeBadge } from "../atoms/FieldTypeBadge";
import { IconButton } from "../atoms/IconButton";

export function SavedComponentListItem({ component }: { component: SavedComponent }) {
  const removeSavedComponent = useFormStore((state) => state.removeSavedComponent);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${component.id}`,
    data: { source: "library", component },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs hover:border-slate-300 hover:bg-white active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-700 dark:text-slate-200">{component.name}</p>
        <FieldTypeBadge type={component.type} />
      </div>
      <IconButton
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => removeSavedComponent(component.id)}
        className="shrink-0 text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300"
        aria-label={`Eliminar ${component.name}`}
      >
        ×
      </IconButton>
    </div>
  );
}
