export const INPUT_CLASSES: string =
  "w-full rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const TEXTAREA_CLASSES: string = `${INPUT_CLASSES} h-24 resize-y font-mono`;

export const HINT_CLASSES: string = "text-[11px] text-fg-subtle";

export const ERROR_CLASSES: string = "text-[11px] text-red-600 dark:text-red-400";

export const ACTION_CLASSES: string =
  "shrink-0 text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover";

export const BADGE_LOADED_CLASSES: string =
  "rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300";

export const BADGE_EMPTY_CLASSES: string =
  "rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-fg-subtle";

// El ano en curso sin fila es el unico estado que hay que ver de lejos: todo lo que se liquide con
// uvt() o smmlv() se queda sin dato, y el script cae a su respaldo sin decir nada en pantalla.
export const WARNING_CLASSES: string = "text-[11px] text-amber-700 dark:text-amber-400";

export const ROW_CLASSES: string =
  "grid grid-cols-[auto_1fr_1fr] gap-x-3 border-b border-border/60 py-1 text-[11px] tabular-nums last:border-b-0";

export const PASTE_PLACEHOLDER: string = '[{ "anio": 2026, "uvt": 52374, "smmlv": 1750905 }, ...]';
