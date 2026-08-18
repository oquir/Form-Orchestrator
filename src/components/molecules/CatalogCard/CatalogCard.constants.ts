export const INPUT_CLASSES: string =
  "w-full rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const TEXTAREA_CLASSES: string = `${INPUT_CLASSES} h-24 resize-y font-mono`;

export const HINT_CLASSES: string = "text-[11px] text-fg-subtle";

export const ERROR_CLASSES: string = "text-[11px] text-red-600 dark:text-red-400";

export const ACTION_CLASSES: string =
  "shrink-0 text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover";

// La insignia dice de un vistazo cuales estan cargados, que es lo que uno viene a mirar a esta
// pestana. Cargado en verde y vacio en gris: el color hace el barrido, no el texto.
export const BADGE_LOADED_CLASSES: string =
  "rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300";

export const BADGE_EMPTY_CLASSES: string =
  "rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-fg-subtle";

export const PASTE_PLACEHOLDER: string = '[{ "id": "05", "nombre": "Antioquia" }, ...]';
