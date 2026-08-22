export { BADGE_LOADED_CLASSES, HINT_CLASSES } from "../../../constants/uiClasses";

export const DATE_INPUT_CLASSES: string =
  "w-28 shrink-0 rounded-md border border-border bg-field px-2 py-1 text-right text-xs tabular-nums text-fg outline-none focus:border-brand-border";

export const BADGE_PARCIAL_CLASSES: string =
  "rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300";

export const PERIODICIDAD_LABEL: Record<string, string> = {
  anual: "Anual",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  mensual: "Mensual",
};

export const DIGITO_LABEL: Record<string, string> = {
  ninguno: "sin dígito",
  primer_digito: "por primer dígito",
  ultimo_digito: "por último dígito",
};
