export const REMOVE_BUTTON_CLASSES: string =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-fg-subtle hover:border-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-30";

export const MOVE_BUTTON_CLASSES: string =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-fg-subtle hover:border-border-strong hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-30";

export const ADD_LINK_CLASSES: string =
  "text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover disabled:cursor-not-allowed disabled:opacity-40";

export const SMALL_SELECT_CLASSES: string =
  "rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const BASE_FORMULA_HINT: string =
  "Se aplica cuando ninguna regla de abajo coincide. Dejálo vacío si el valor siempre sale de una regla.";

export const RULES_HINT: string =
  "Gana la primera regla que se cumpla, de arriba hacia abajo. Una regla sin condiciones se cumple siempre.";
