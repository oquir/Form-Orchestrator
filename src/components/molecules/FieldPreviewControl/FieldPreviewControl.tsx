import { ArrowDown2, Calculator, Import } from "reicon-react";
import { MOCK_CONTROL_CLASSES } from "./FieldPreviewControl.constants";
import type { FieldPreviewControlProps } from "./FieldPreviewControl.types";

export function FieldPreviewControl({ field }: FieldPreviewControlProps) {
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
                className={`rounded-md border px-2.5 py-1 text-xs overflow-x-hidden ${
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
            <p className="text-[11px] text-slate-400 overflow-x-hidden underline decoration-dotted dark:text-neutral-500">
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
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-neutral-400 overflow-x-hidden">
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
          <div className="flex flex-wrap gap-1 overflow-x-hidden">
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
