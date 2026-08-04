import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Eye, InfoCircle } from "reicon-react";
import { GRID_BASE_COLUMNS } from "../../../constants/grid";
import { hasTooltip } from "../../../lib/fieldTooltip/fieldTooltip";
import { getFreeRuns, getMaxSpanAt } from "../../../lib/rowLayout/rowLayout";
import { useFormStore } from "../../../store/formStore";
import { FieldDragHandle } from "../../atoms/FieldDragHandle/FieldDragHandle";
import { FieldResizeHandle } from "../../atoms/FieldResizeHandle/FieldResizeHandle";
import { FieldTypeBadge } from "../../atoms/FieldTypeBadge/FieldTypeBadge";
import { FieldPreviewControl } from "../FieldPreviewControl/FieldPreviewControl";
import { TooltipBubble } from "../TooltipBubble/TooltipBubble";
import type { CanvasFieldChipProps } from "./CanvasFieldChip.types";
import { getChipPaddingClasses } from "./CanvasFieldChip.utils";

export function CanvasFieldChip({
  field,
  rowId,
  rowColumns,
  rowFields,
  linkedLabel,
  selected,
  onClick,
  onContextMenu,
}: CanvasFieldChipProps) {
  const updateField = useFormStore((state) => state.updateField);
  const maxSpan = getMaxSpanAt(getFreeRuns(rowFields, rowColumns, field.id), field.colStart);

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

  const isUltraCompact = field.colSpan === 1 && rowColumns >= GRID_BASE_COLUMNS;
  const isCompact = rowColumns >= 13 && field.colSpan === 1;
  const shouldHideContent = field.colSpan === 1 && rowColumns >= 14;
  const showTooltip: boolean = hasTooltip(field);

  return (
    <div
      ref={setRefs}
      style={{ gridColumn: `${field.colStart} / span ${field.colSpan}` }}
      className={`group relative min-w-0 ${isDragging ? "opacity-40" : ""}`}
    >
      <div
        className={`relative group/tooltip ${
          isOver ? "rounded-md outline-2 outline-orange-400 dark:outline-orange-500" : ""
        }`}
        style={{ marginTop: field.styles.marginTop, marginBottom: field.styles.marginBottom }}
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
            className={`flex items-center justify-between gap-2 overflow-x-hidden ${shouldHideContent ? "opacity-0" : ""}`}
          >
            <div className="flex min-w-0 items-center gap-1">
              {linkedLabel ? (
                <p
                  title={`La etiqueta la aporta "${linkedLabel.label}"`}
                  className="text-sm font-medium italic text-fg-muted"
                >
                  {linkedLabel.label}
                </p>
              ) : (
                <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">
                  {field.label}
                </p>
              )}
              {showTooltip && <InfoCircle size={12} className="shrink-0 text-fg-subtle" />}
            </div>
            <div className="flex items-center gap-1">
              {field.visibleWhen && (
                <span
                  title="Visibilidad condicional"
                  className="flex items-center rounded-full bg-sky-100 px-1.5 py-0.5 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
                >
                  <Eye size={10} weight="Filled" />
                </span>
              )}
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
          <div className={shouldHideContent ? "opacity-0" : ""}>
            <FieldPreviewControl field={field} />
          </div>
        </button>
        {showTooltip && field.tooltip && <TooltipBubble tooltip={field.tooltip} />}
        <FieldResizeHandle
          colSpan={field.colSpan}
          rowColumns={rowColumns}
          maxSpan={maxSpan}
          onResize={(next) => updateField(field.id, { colSpan: next })}
        />
      </div>
    </div>
  );
}
