import type { TooltipPosition } from "../types/field";

export const TOOLTIP_POSITIONS: TooltipPosition[] = ["top", "bottom", "left", "right"];

export const DEFAULT_TOOLTIP_POSITION: TooltipPosition = "top";

export const TOOLTIP_ANCHOR_CLASSES: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-1.5 -translate-x-1/2",
  left: "right-full top-1/2 mr-1.5 -translate-y-1/2",
  right: "left-full top-1/2 ml-1.5 -translate-y-1/2",
};

export const TOOLTIP_SURFACE_CLASSES: string =
  "w-max max-w-56 rounded-md bg-slate-800 px-2 py-1.5 shadow-lg dark:bg-neutral-700";

export const TOOLTIP_TEXT_CLASSES: string = "text-[11px] text-white";
