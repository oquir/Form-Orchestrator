import { type PointerEvent as ReactPointerEvent, useState } from "react";
import { ArrowDown2, Calculator, Import } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import type { CanvasField } from "../../../types/storeTypes";
import { FieldTypeBadge } from "../../atoms/FieldTypeBadge/FieldTypeBadge";
import { GRID_GAP_PX, MOCK_CONTROL_CLASSES } from "./CanvasFieldChip.constants";
import type { CanvasFieldChipProps } from "./CanvasFieldChip.types";

function FieldPreviewControl({ field }: { field: CanvasField }) {
  switch (field.type) {
    case "toggle_group": {
      const options = field.options ?? [];
      return (
        <div className="flex flex-col gap-1.5">
          {field.title && (
            <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
              {field.title}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {options.map((option, index) => (
              <span
                key={option.id}
                className={`rounded-md border px-2.5 py-1 text-xs ${
                  index === 0
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-500 dark:bg-orange-500/10 dark:text-orange-400"
                    : "border-slate-200 bg-slate-50 text-slate-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                }`}
              >
                {option.label}
              </span>
            ))}
          </div>
          {!field.validations.required && (
            <p className="text-[11px] text-slate-400 underline decoration-dotted dark:text-neutral-500">
              Limpiar selección
            </p>
          )}
        </div>
      );
    }
    case "select":
      return (
        <div className={MOCK_CONTROL_CLASSES}>
          <span>Seleccionar…</span>
          <ArrowDown2 size={14} weight="Filled" />
        </div>
      );
    case "textarea":
      return (
        <div className={`${MOCK_CONTROL_CLASSES} h-16 items-start`}>
          <span>Escribe aquí…</span>
        </div>
      );
    case "checkbox":
      return (
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-neutral-400">
          <span className="h-4 w-4 shrink-0 rounded border border-slate-300 bg-white dark:border-neutral-600 dark:bg-neutral-900" />
          Marcar opción
        </p>
      );
    case "calculated":
      return (
        <div className={MOCK_CONTROL_CLASSES}>
          <span>Valor calculado</span>
          <Calculator size={14} weight="Filled" />
        </div>
      );
    case "number":
      return (
        <div className={MOCK_CONTROL_CLASSES}>
          <span>0</span>
        </div>
      );
    case "file": {
      const config = field.fileConfig ?? { acceptedFormats: [], maxSizeMB: 10 };
      const formatsLabel =
        config.acceptedFormats.length > 0 ? config.acceptedFormats.join(", ") : "Cualquier formato";
      return (
        <div className="flex flex-col gap-1.5">
          <div className={MOCK_CONTROL_CLASSES}>
            <span>Seleccionar archivo…</span>
            <Import size={14} weight="Filled" />
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              {formatsLabel}
            </span>
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              Máx {config.maxSizeMB}MB
            </span>
          </div>
        </div>
      );
    }
    default:
      return (
        <div className={MOCK_CONTROL_CLASSES}>
          <span>Texto de ejemplo</span>
        </div>
      );
  }
}

export function CanvasFieldChip({
  field,
  rowColumns,
  selected,
  onClick,
  onContextMenu,
}: CanvasFieldChipProps) {
  const updateField = useFormStore((state) => state.updateField);
  const [isResizing, setIsResizing] = useState(false);

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
      style={{ gridColumn: `span ${field.colSpan} / span ${field.colSpan}` }}
      className="group relative"
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">{field.label}</p>
          <FieldTypeBadge type={field.type} />
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
