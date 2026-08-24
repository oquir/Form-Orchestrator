import { useDroppable } from "@dnd-kit/core";
import { Xmark } from "reicon-react";
import type { StepTabChipProps } from "./StepTabChip.types";
import { transferClasses } from "./StepTabChip.utils";

export function StepTabChip({
  index,
  label,
  active,
  canvasTarget,
  transferState = "idle",
  onSelect,
  onRemove,
  removeTitle,
  removeIconSize = 12,
  className = "",
}: StepTabChipProps) {
  // Apagada salvo que haya una mudanza en curso que esta pestana pueda recibir: fuera de eso no
  // debe competir por ningun drop, y una pestana rechazada tampoco acepta el suyo.
  const { setNodeRef, isOver } = useDroppable({
    id: `tab-${canvasTarget.type}-${canvasTarget.stepId}`,
    data: { canvasTarget },
    disabled: transferState !== "ready",
  });

  // Contraida a su numero para que el panel no tenga que rodar por muchos steps que haya. Solo la
  // activa se expande con su titulo: es la unica que no cambia a mitad de un arrastre, asi que el
  // layout no se mueve durante el gesto. El titulo completo sigue disponible como tooltip nativo.
  if (!active) {
    return (
      <div
        ref={setNodeRef}
        className={`relative shrink-0 rounded-md ${transferClasses(transferState, isOver)} ${className}`}
      >
        <button
          type="button"
          onClick={onSelect}
          title={label}
          aria-label={label}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-500 transition-colors hover:cursor-pointer hover:bg-slate-200 dark:bg-neutral-800/70 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          {index}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex items-center gap-2 rounded-lg border border-orange-600 bg-[#f8e8e2] text-xs font-medium text-slate-900 dark:border-orange-500 dark:bg-[#21140f] dark:text-white ${transferClasses(transferState, isOver)} ${className}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex select-none items-center gap-2 hover:cursor-pointer py-1.5 pr-3 pl-1.5"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-orange-600 text-[11px] font-semibold text-white dark:bg-orange-500">
          {index}
        </span>
        {label}
      </button>

      {onRemove && (
        <button
          type="button"
          title={removeTitle}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-right-1.5 -top-1.5 absolute flex h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-red-300 hover:text-red-500 hover:cursor-pointer dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-red-400 dark:hover:text-red-400"
        >
          <Xmark size={removeIconSize} weight="Filled" />
        </button>
      )}
    </div>
  );
}
