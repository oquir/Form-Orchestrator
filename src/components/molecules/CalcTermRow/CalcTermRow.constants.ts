import type { CalcSignChoice } from "./CalcTermRow.types";

export { SELECT_CLASSES } from "../../../constants/uiClasses";

// El menos se dibuja con el signo tipografico (U+2212): el guion comun queda corto y fino al lado
// del +, y a simple vista parece otra cosa.
export const CALC_SIGN_CHOICES: CalcSignChoice[] = [
  { sign: "+", symbol: "+", label: "Sumar" },
  { sign: "-", symbol: "−", label: "Restar" },
];

export const CYCLE_SUFFIX: string = "(ya depende de este campo)";

// Riel hundido con el signo activo en pastilla elevada, como el selector de Vista del panel derecho.
export const SIGN_TRACK_CLASSES: string =
  "flex shrink-0 gap-0.5 rounded-lg border border-border bg-surface-sunken p-[3px]";

export const SIGN_ITEM_BASE_CLASSES: string =
  "flex h-6 w-7 items-center justify-center rounded-md text-sm transition-colors hover:cursor-pointer";

export const SIGN_ITEM_ACTIVE_CLASSES: string =
  "bg-surface font-semibold text-fg-strong shadow-sm dark:bg-surface-inset";

export const SIGN_ITEM_INACTIVE_CLASSES: string = "font-medium text-fg-muted hover:text-fg-strong";

export const REMOVE_BUTTON_CLASSES: string =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-fg-subtle hover:cursor-pointer hover:border-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-30";
