export const BAND_CLASSES: string =
  "col-span-16 flex flex-col gap-3 rounded-lg border-2 border-slate-300 dark:border-neutral-700 border-dotted bg-white dark:bg-neutral-900 p-3";

export const BAND_INPUT_CLASSES: string =
  "rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const BAND_NUMBER_CLASSES: string = `${BAND_INPUT_CLASSES} w-14`;

export const BAND_ACTION_CLASSES: string =
  "text-[11px] font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover";

// El resumen de lo que antes ocupaba una fila entera de inputs. Se lee, no se toca.
export const BAND_SUMMARY_CLASSES: string = "text-[11px] tabular-nums text-fg-subtle";

export const BAND_DISSOLVE_CLASSES: string =
  "self-start text-[11px] font-medium text-fg-subtle hover:cursor-pointer hover:text-danger";
