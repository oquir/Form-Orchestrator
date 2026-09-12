// Abre hacia arriba: la barra vive pegada al borde inferior del lienzo, y hacia abajo se saldria de
// la ventana.
export const MENU_CLASSES: string =
  "absolute bottom-full left-1/2 mb-2 flex max-h-72 w-60 -translate-x-1/2 flex-col overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-lg dark:bg-surface-raised";

export const MENU_CAPTION_CLASSES: string =
  "px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-fg-subtle";

export const MENU_ITEM_CLASSES: string =
  "flex items-center gap-2 px-2.5 py-1.5 text-left text-xs text-fg-soft transition-colors hover:cursor-pointer hover:bg-surface-raised dark:hover:bg-surface-inset";

export const MENU_NUMBER_CLASSES: string =
  "flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface-raised text-[10px] font-semibold tabular-nums text-fg-muted dark:bg-surface-inset";
