export {
  HINT_CLASSES,
  WARNING_BANNER_CLASSES as WARNING_CLASSES,
} from "../../../../constants/uiClasses";

// Informativo, no un problema: el campo esta dentro de un grupo repetible y conviene decirlo.
export const NOTE_CLASSES: string =
  "rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300";

export const ERROR_CLASSES: string =
  "rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400";

export const DESTINATION_DESCRIPTION: string =
  "A qué propiedad del objeto que recibe la API va a parar el valor de este campo. Un campo excluido sigue sirviendo para cálculos y condiciones, pero no viaja.";
