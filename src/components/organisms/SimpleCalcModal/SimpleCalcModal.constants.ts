export {
  ADD_LINK_CLASSES,
  ERROR_CLASSES,
  HINT_CLASSES,
  INPUT_CLASSES,
  WARNING_BANNER_CLASSES,
} from "../../../constants/uiClasses";

export const TITLE_CLASSES: string =
  "mb-1 text-lg font-semibold text-slate-800 dark:text-neutral-100";

export const SUBTITLE_CLASSES: string = "mb-4 text-sm text-slate-500 dark:text-neutral-400";

// El modal se dibuja en su lugar (ModalShell no usa portal), asi que hereda el color de texto de
// donde se abra: el sidebar lo pinta gris. Por eso el cuerpo fija el suyo.
export const BODY_CLASSES: string =
  "mb-4 flex max-h-[55vh] flex-col gap-4 overflow-y-auto pr-1 text-sm text-fg";

export const OPTION_LABEL_CLASSES: string = "text-sm text-fg";

export const CODE_SUMMARY_CLASSES: string =
  "text-xs font-medium text-fg-muted hover:cursor-pointer hover:text-fg-strong";

export const CODE_CLASSES: string =
  "mt-2 whitespace-pre-wrap break-all rounded-md border border-border bg-surface-sunken p-2 font-mono text-[11px] text-fg";

export const CUSTOM_SCRIPT_WARNING: string =
  "Este campo tiene un cálculo escrito en código que no se puede mostrar acá. Aplicar lo reemplaza (Ctrl+Z lo trae de vuelta).";

export const MULTIPLIER_HINT: string = "Vacío no multiplica. Para un 15 % escribí 0.15.";

export const FLOOR_HINT: string = "Si el resultado da negativo, el campo queda en 0.";

export const INCOMPLETE_PREVIEW: string = "Elegí un campo en cada fila para ver el código.";
