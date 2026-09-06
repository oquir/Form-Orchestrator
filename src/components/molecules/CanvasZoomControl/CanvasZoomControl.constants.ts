// Los saltos que ofrece el menu. Todos caen dentro de [ZOOM_MIN, ZOOM_MAX]: si alguno se saliera,
// clampZoom lo recortaria y el menu mostraria un porcentaje que al elegirlo da otro.
export const ZOOM_PRESETS: number[] = [0.5, 0.75, 1, 1.25, 1.5];

export const ZOOM_TRIGGER_CLASSES: string =
  "flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium tabular-nums text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer";

export const ZOOM_ITEM_CLASSES: string =
  "flex items-center justify-between gap-4 px-2.5 py-1.5 text-left text-xs text-fg-soft transition-colors hover:bg-surface-raised hover:cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:cursor-not-allowed";

export const ZOOM_SHORTCUT_CLASSES: string = "text-[10px] tabular-nums text-fg-subtle";
