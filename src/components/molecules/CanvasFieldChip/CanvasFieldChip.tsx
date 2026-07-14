import { useDraggable, useDroppable } from "@dnd-kit/core";
import { type PointerEvent as ReactPointerEvent, useState } from "react";
import { useFormStore } from "../../../store/formStore";
import { FieldTypeBadge } from "../../atoms/FieldTypeBadge/FieldTypeBadge";
import { FieldPreviewControl } from "../FieldPreviewControl/FieldPreviewControl";
import { GRID_GAP_PX } from "./CanvasFieldChip.constants";
import type { CanvasFieldChipProps } from "./CanvasFieldChip.types";

export function CanvasFieldChip({
  field,
  rowId,
  rowColumns,
  selected,
  onClick,
  onContextMenu,
}: CanvasFieldChipProps) {
  const updateField = useFormStore((state) => state.updateField);
  const [isResizing, setIsResizing] = useState(false);

  const {
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: field.id,
    data: { source: "canvas-field", field, rowId },
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: field.id,
    data: { rowId, fieldId: field.id },
  });

  function setRefs(node: HTMLDivElement | null) {
    setDragRef(node);
    setDropRef(node);
  }

  function handleResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    const rowElement = event.currentTarget.closest<HTMLElement>("[data-canvas-row]");
    if (!rowElement) return;

    const rowRect = rowElement.getBoundingClientRect();
    const rowStyles = window.getComputedStyle(rowElement);
    const paddingLeft = Number.parseFloat(rowStyles.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(rowStyles.paddingRight) || 0;
    const usableWidth = rowRect.width - paddingLeft - paddingRight;
    const perColumn = (usableWidth - (rowColumns - 1) * GRID_GAP_PX) / rowColumns;
    if (perColumn <= 0) return;

    const startX = event.clientX;
    const startColSpan = field.colSpan;
    let lastApplied = startColSpan;

    setIsResizing(true);

    function handlePointerMove(moveEvent: PointerEvent) {
      const deltaX = moveEvent.clientX - startX;
      const deltaCols = Math.round(deltaX / (perColumn + GRID_GAP_PX));
      const next = Math.max(1, Math.min(rowColumns, startColSpan + deltaCols));
      if (next !== lastApplied) {
        lastApplied = next;
        updateField(field.id, { colSpan: next });
      }
    }

    function handlePointerUp() {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      setIsResizing(false);
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <div
      ref={setRefs}
      {...listeners}
      style={{ gridColumn: `span ${field.colSpan} / span ${field.colSpan}` }}
      className={`group relative cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""} ${
        isOver ? "rounded-md outline outline-2 outline-orange-400 dark:outline-orange-500" : ""
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        onContextMenu={onContextMenu}
        style={{
          marginTop: field.styles.marginTop,
          marginBottom: field.styles.marginBottom,
          backgroundColor: field.styles.backgroundColor,
          color: field.styles.textColor,
        }}
        className={`flex w-full flex-col gap-1.5 rounded-md border bg-white p-3 text-left shadow-sm transition-colors dark:bg-neutral-800 ${
          selected
            ? "border-orange-600 ring-1 ring-orange-600 dark:border-orange-500 dark:ring-orange-500"
            : "border-slate-200 hover:border-slate-300 dark:border-neutral-700 dark:hover:border-neutral-600"
        } ${field.styles.customClasses ?? ""}`}
      >
        <div className="flex items-center justify-between gap-2 overflow-x-hidden">
          <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">{field.label}</p>
          <div className="flex items-center gap-1">
            {field.alwaysDisabled && (
              <span
                title="Siempre deshabilitado (solo lectura)"
                className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-neutral-700 dark:text-neutral-300"
              >
                RO
              </span>
            )}
            {!field.alwaysDisabled && field.enableWhen && (
              <span
                title="Habilitación condicional"
                className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-medium text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
              >
                IF
              </span>
            )}
            <FieldTypeBadge type={field.type} />
          </div>
        </div>
        <FieldPreviewControl field={field} />
      </button>
      <div
        onPointerDown={handleResizePointerDown}
        title={`Redimensionar (${field.colSpan}/${rowColumns})`}
        className={`absolute -right-1 top-1/2 h-8 w-1.5 -translate-y-1/2 cursor-col-resize rounded-full transition-colors ${
          isResizing
            ? "bg-orange-500"
            : "bg-slate-200 opacity-0 hover:bg-orange-400 group-hover:opacity-100 dark:bg-neutral-600"
        }`}
        style={{ opacity: isResizing ? 1 : undefined }}
      />
    </div>
  );
}
