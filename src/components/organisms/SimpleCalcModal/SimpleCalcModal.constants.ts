export {
  ERROR_CLASSES,
  HINT_CLASSES,
  WARNING_BANNER_CLASSES,
} from "../../../constants/uiClasses";

export const SECTION_TITLE_CLASSES: string =
  "text-[11px] font-semibold uppercase tracking-wider text-fg-soft";

export const SECTION_COUNT_CLASSES: string = "text-[11px] tabular-nums text-fg-subtle";

export const ADD_TERM_CLASSES: string =
  "flex w-full items-center justify-center gap-2 border-border-strong py-2.5 text-fg-soft hover:border-brand-border hover:bg-brand-surface hover:text-brand-fg";

// Las opciones van en tarjetas como las filas (CalcTermRow): el mismo velo en oscuro, slate-100 en
// claro. Van lado a lado y el control baja al pie con mt-auto, asi quedan a la misma altura.
export const OPTION_CARD_CLASSES: string =
  "flex flex-col gap-3 rounded-lg border border-border bg-surface-raised p-4 dark:bg-black/25";

export const OPTION_TITLE_CLASSES: string = "text-sm font-semibold text-fg-strong";

export const OPTION_HINT_CLASSES: string = "text-xs leading-relaxed text-fg-muted";

export const INLINE_CODE_CLASSES: string =
  "rounded border border-border bg-field px-1 font-mono text-[11px] text-brand-fg";

export const MULTIPLIER_INPUT_CLASSES: string =
  "h-9 min-w-0 flex-1 rounded-l-md border border-border bg-field px-3 font-mono text-sm text-fg outline-none transition-colors hover:border-border-strong focus:border-brand-border";

export const MULTIPLIER_ADDON_CLASSES: string =
  "flex items-center rounded-r-md border border-l-0 border-border bg-surface-sunken px-3 text-xs font-medium text-fg-muted";

export const FLOOR_TIP_CLASSES: string =
  "mt-auto flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-fg-subtle";

export const CODE_DETAILS_CLASSES: string =
  "group/code rounded-lg border border-border bg-surface-raised dark:bg-black/25";

// flex en el summary ya quita el triangulo en Chrome y Firefox; Safari necesita el pseudo-elemento.
export const CODE_SUMMARY_CLASSES: string =
  "flex list-none items-center justify-between gap-2 px-4 py-3 text-xs font-semibold text-fg-muted transition-colors hover:cursor-pointer hover:text-fg-strong [&::-webkit-details-marker]:hidden";

export const CODE_CHEVRON_CLASSES: string = "transition-transform group-open/code:rotate-180";

export const CUSTOM_SCRIPT_WARNING: string =
  "Este campo tiene un cálculo escrito en código que no se puede mostrar acá. Aplicar lo reemplaza (Ctrl+Z lo trae de vuelta).";

export const FLOOR_HINT: string = "Si el resultado da negativo, el campo queda en 0.";

export const FLOOR_TIP: string = "Típico de saldos y totales a pagar.";

export const INCOMPLETE_PREVIEW: string = "Elegí un campo en cada fila para ver el código.";
