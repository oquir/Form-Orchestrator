import { ArrowDown2, Calculator } from "reicon-react";
import type { CanvasField } from "../../../types/storeTypes";
import { FieldTypeBadge } from "../../atoms/FieldTypeBadge/FieldTypeBadge";
import { MOCK_CONTROL_CLASSES } from "./CanvasFieldChip.constants";
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
    default:
      return (
        <div className={MOCK_CONTROL_CLASSES}>
          <span>Texto de ejemplo</span>
        </div>
      );
  }
}

export function CanvasFieldChip({ field, selected, onClick, onContextMenu }: CanvasFieldChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{
        gridColumn: `span ${field.colSpan} / span ${field.colSpan}`,
        marginTop: field.styles.marginTop,
        marginBottom: field.styles.marginBottom,
        backgroundColor: field.styles.backgroundColor,
        color: field.styles.textColor,
      }}
      className={`flex flex-col gap-1.5 rounded-md border bg-white p-3 text-left shadow-sm transition-colors dark:bg-neutral-800 ${
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
  );
}
