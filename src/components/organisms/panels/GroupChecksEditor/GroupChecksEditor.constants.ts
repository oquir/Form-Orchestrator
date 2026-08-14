export const HINT_CLASSES: string = "text-[11px] text-fg-subtle";

export const ERROR_CLASSES: string = "text-[11px] text-danger";

export const INPUT_CLASSES: string =
  "w-full rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const CHECK_CARD_CLASSES: string =
  "flex flex-col gap-2 rounded-md border border-border bg-surface-sunken p-2.5";

export const CHECK_PLACEHOLDER: string =
  "return abs(sum({ingresos_gravados}) - {total_ingresos_gravables}) < 1;";

export const CHECK_HINT: string =
  "Se evalúa una vez para todo el grupo, no por repetición: desde acá {campo} de una columna es el arreglo entero y sum lo aplana. Devolvé true si está bien y false si no.";

export const MESSAGE_HINT: string =
  "El mensaje que ve el contribuyente cuando la comprobación falla. Se muestra sobre las repeticiones y no lo deja avanzar de paso.";
