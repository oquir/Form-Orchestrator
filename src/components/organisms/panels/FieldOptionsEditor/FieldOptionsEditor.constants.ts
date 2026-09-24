export { COUNT_CLASSES } from "../../../../constants/uiClasses";

export const OPTION_INPUT_CLASSES: string =
  "w-full rounded-md border border-border bg-field px-2 py-1.5 text-sm text-fg outline-none focus:border-brand-border";

export const REMOVE_OPTION_CLASSES: string =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-fg-subtle hover:border-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-30";

export const MIN_OPTIONS: number = 2;

export const OPTIONS_DESCRIPTION: string =
  "Las opciones escritas a mano, que viajan tal cual en el JSON. Existen porque el campo está excluido del payload y no tiene catálogo: si vuelve a incluirse o declara uno, se descartan.";
