import { AngleDown2, AngleLeft2, AngleRight2, AngleUp2 } from "reicon-react";
import type { TooltipPosition } from "../../../../types/field";
import type { TooltipPositionOption } from "./FieldTooltipEditor.types";

export const TOOLTIP_POSITION_OPTIONS: Record<TooltipPosition, TooltipPositionOption> = {
  top: { label: "Arriba", icon: AngleUp2 },
  bottom: { label: "Abajo", icon: AngleDown2 },
  left: { label: "Izquierda", icon: AngleLeft2 },
  right: { label: "Derecha", icon: AngleRight2 },
};

export const POSITION_BUTTON_CLASSES: string =
  "flex w-full flex-col items-center gap-0.5 rounded-md border px-1 py-1.5 text-[10px] font-medium transition-colors hover:cursor-pointer";

export const POSITION_ACTIVE_CLASSES: string = "border-brand-border bg-brand-surface text-brand-fg";

export const POSITION_IDLE_CLASSES: string =
  "border-border bg-field text-fg-muted hover:border-border-strong";
