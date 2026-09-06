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

  // Todas las pestanas son su numero, la activa incluida: la activa se distingue por el relleno de
  // marca y su halo, no por expandirse con el titulo. Expandirla movia la grilla entera cada vez
  // que se cambiaba de paso -- justo lo que no puede pasar mientras se apunta a una de estas
  // pestanas con una fila colgando del puntero. El titulo vive en el bloque "Paso activo" y sigue
  // a un hover de distancia en el title nativo.
  const chipClasses: string = active
    ? "bg-brand text-on-brand ring-[3px] ring-brand/20"
    : "bg-surface-raised text-fg-muted hover:bg-surface-inset hover:text-fg-strong";

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
        aria-current={active ? "step" : undefined}
        className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums transition-colors hover:cursor-pointer ${chipClasses}`}
      >
        {index}
      </button>

      {active && onRemove && (
        <button
          type="button"
          title={removeTitle}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-right-1.5 -top-1.5 absolute flex h-4 w-4 items-center justify-center rounded-full border border-border bg-surface text-fg-subtle shadow-sm transition-colors hover:border-danger-soft hover:text-danger hover:cursor-pointer"
        >
          <Xmark size={removeIconSize} weight="Filled" />
        </button>
      )}
    </div>
  );
}
