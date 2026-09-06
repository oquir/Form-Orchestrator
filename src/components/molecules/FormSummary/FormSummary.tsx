import { Document2 } from "reicon-react";
import { FORM_TYPES } from "../../../constants/formType";
import { getAllFields, useFormStore } from "../../../store/formStore";
import {
  IDENT_BADGE_CLASSES,
  METRIC_CAPTION_CLASSES,
  METRIC_CELL_CLASSES,
  METRIC_NUMBER_CLASSES,
  METRICS_GRID_CLASSES,
} from "./FormSummary.constants";

export function FormSummary() {
  const formSteps = useFormStore((state) => state.formSteps);
  const setupConfig = useFormStore((state) => state.setupConfig);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const lastSavedAt = useFormStore((state) => state.lastSavedAt);

  const formTypeLabel: string =
    FORM_TYPES.find((option) => option.value === setupConfig.formType)?.label ?? "Sin definir";
  const fieldCount: number = formSteps.reduce(
    (total, step) => total + getAllFields(step.rows).length,
    0,
  );
  const hasIntro: boolean = setupConfig.hasIntroModal;
  const savedLabel: string = lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : "—";

  return (
    <>
      <div className="flex items-center gap-2.5">
        <span className={IDENT_BADGE_CLASSES}>
          <Document2 size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold leading-4 text-fg-strong">{formTypeLabel}</p>
          <p className="mt-px text-[10px] leading-[14px] text-fg-subtle">Tipo de formulario</p>
        </div>
      </div>

      <div className={`${METRICS_GRID_CLASSES} ${hasIntro ? "grid-cols-3" : "grid-cols-2"}`}>
        <div className={METRIC_CELL_CLASSES}>
          <span className={METRIC_NUMBER_CLASSES}>{formSteps.length}</span>
          <span className={METRIC_CAPTION_CLASSES}>Steps</span>
        </div>
        {hasIntro && (
          <div className={METRIC_CELL_CLASSES}>
            <span className={METRIC_NUMBER_CLASSES}>{introSteps.length}</span>
            <span className={METRIC_CAPTION_CLASSES}>Modal</span>
          </div>
        )}
        <div className={METRIC_CELL_CLASSES}>
          <span className={METRIC_NUMBER_CLASSES}>{fieldCount}</span>
          <span className={METRIC_CAPTION_CLASSES}>Campos</span>
        </div>
      </div>

      {/* El punto distingue guardado de nunca guardado sin gastar una fila en decirlo. */}
      <div className="flex items-center gap-2 text-[11px] text-fg-subtle">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ring-[3px] ${
            lastSavedAt ? "bg-success ring-success/20" : "bg-fg-subtle ring-fg-subtle/20"
          }`}
        />
        {lastSavedAt ? "Guardado" : "Sin guardar"}
        <span className="ml-auto font-medium tabular-nums text-fg-soft">{savedLabel}</span>
      </div>
    </>
  );
}
