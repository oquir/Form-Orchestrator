export { ADD_LINK_CLASSES, HINT_CLASSES, WARNING_CLASSES } from "../../../constants/uiClasses";

// La tarjeta es la de las filas del calculo sin codigo (CalcTermRow): en oscuro un velo negro la
// deja apenas mas oscura que el modal, en claro va slate-100.
export const CARD_CLASSES: string =
  "flex flex-col rounded-lg border border-border bg-surface-raised dark:bg-black/25";

export const HEADER_CLASSES: string = "flex items-center gap-3 border-b border-border px-4 py-3";

export const NUMBER_BADGE_CLASSES: string =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-surface text-[11px] font-semibold tabular-nums text-brand-fg";

export const NAME_INPUT_CLASSES: string =
  "min-w-0 flex-1 rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const ICON_BUTTON_CLASSES: string =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-subtle transition-colors hover:cursor-pointer hover:bg-surface hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg-subtle";

export const DELETE_BUTTON_CLASSES: string =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-subtle transition-colors hover:cursor-pointer hover:bg-danger-surface hover:text-danger";

export const BLOCK_CLASSES: string = "flex flex-col gap-3 px-4 py-3";

export const BLOCK_TITLE_CLASSES: string =
  "text-[11px] font-semibold uppercase tracking-wider text-fg-soft";

export const MATCH_SELECT_CLASSES: string =
  "rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";
