import type { DateBoundModeOption, DateBoundUnitOption } from "./DateBoundInput.types";

export const MODE_OPTIONS: DateBoundModeOption[] = [
  { mode: "none", label: "Sin límite" },
  { mode: "today", label: "Hoy" },
  { mode: "past", label: "Hace…" },
  { mode: "future", label: "Dentro de…" },
  { mode: "fixed", label: "Una fecha fija" },
];

export const UNIT_OPTIONS: DateBoundUnitOption[] = [
  { unit: "days", label: "días" },
  { unit: "months", label: "meses" },
  { unit: "years", label: "años" },
];

export const CONTROL_CLASSES: string =
  "w-full rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

// El icono del calendario lo pinta el navegador: sin color-scheme oscuro queda negro sobre negro.
export const DATE_CONTROL_CLASSES: string = `${CONTROL_CLASSES} dark:[color-scheme:dark]`;
