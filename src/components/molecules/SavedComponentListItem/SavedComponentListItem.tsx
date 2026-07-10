import { useDraggable } from "@dnd-kit/core";
import { useFormStore } from "../../../store/formStore";
import type { SavedComponent } from "../../../types/storeTypes";
import { FieldTypeBadge } from "../../atoms/FieldTypeBadge/FieldTypeBadge";
import { IconButton } from "../../atoms/IconButton/IconButton";

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
      className={`flex cursor-grab items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs hover:border-slate-300 hover:bg-white active:cursor-grabbing dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:bg-neutral-700 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-700 dark:text-neutral-200">
          {component.name}
        </p>
        <FieldTypeBadge type={component.type} />
      </div>
      <IconButton
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => removeSavedComponent(component.id)}
        className="shrink-0 text-slate-300 hover:text-slate-600 dark:text-neutral-600 dark:hover:text-neutral-300"
        aria-label={`Eliminar ${component.name}`}
      >
        Ã—
      </IconButton>
    </div>
  );
}
