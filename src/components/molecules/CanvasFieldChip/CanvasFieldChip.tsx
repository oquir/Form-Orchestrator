import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GRID_BASE_COLUMNS } from "../../../constants/grid";
import { useFormStore } from "../../../store/formStore";
import { FieldDragHandle } from "../../atoms/FieldDragHandle/FieldDragHandle";
import { FieldResizeHandle } from "../../atoms/FieldResizeHandle/FieldResizeHandle";
import { FieldTypeBadge } from "../../atoms/FieldTypeBadge/FieldTypeBadge";
import { FieldPreviewControl } from "../FieldPreviewControl/FieldPreviewControl";
import type { CanvasFieldChipProps } from "./CanvasFieldChip.types";
import { getChipPaddingClasses } from "./CanvasFieldChip.utils";

export function CanvasFieldChip({
  field,
  rowId,
  rowColumns,
  selected,
  onClick,
  onContextMenu,
}: CanvasFieldChipProps) {
  const updateField = useFormStore((state) => state.updateField);

  const {
    listeners,
    attributes,
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

  function setRefs(node: HTMLDivElement | null): void {
    setDragRef(node);
    setDropRef(node);
  }

  const isUltraCompact: boolean = field.colSpan === 1 && rowColumns >= GRID_BASE_COLUMNS;
  const isCompact: boolean = rowColumns >= 13 && field.colSpan === 1;
  const isopacityapply: boolean = field.colSpan === 1 && rowColumns >= 14;

  return (
    <div
      ref={setRefs}
      style={{ gridColumn: `span ${field.colSpan} / span ${field.colSpan}` }}
      className={`group relative min-w-0 ${isDragging ? "opacity-40" : ""} ${
        isOver ? "rounded-md outline-2 outline-orange-400 dark:outline-orange-500" : ""
      }`}
    >
      <FieldDragHandle
        listeners={listeners}
        attributes={attributes}
        colSpan={field.colSpan}
        rowColumns={rowColumns}
      />
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
        className={`flex w-full flex-col gap-1.5 rounded-md border bg-white py-3 text-left shadow-sm transition-colors dark:bg-neutral-800 ${getChipPaddingClasses(
          isCompact,
          isUltraCompact,
        )} ${
          selected
            ? "border-orange-600 ring-1 ring-orange-600 dark:border-orange-500 dark:ring-orange-500"
            : "border-slate-200 hover:border-slate-300 dark:border-neutral-700 dark:hover:border-neutral-600"
        } ${field.styles.customClasses ?? ""}`}
      >
        <div
          className={`flex items-center justify-between gap-2 overflow-x-hidden ${isopacityapply ? "opacity-0" : ""}`}
        >
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
        <div className={isopacityapply ? "opacity-0" : ""}>
          <FieldPreviewControl field={field} />
        </div>
      </button>
      <FieldResizeHandle
        colSpan={field.colSpan}
        rowColumns={rowColumns}
        onResize={(next) => updateField(field.id, { colSpan: next })}
      />
    </div>
  );
}
