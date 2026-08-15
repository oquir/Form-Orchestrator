import type { DeclaracionKind } from "../../../../types/maxDates";

export const INPUT_CLASSES: string =
  "w-full rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const TEXTAREA_CLASSES: string = `${INPUT_CLASSES} h-24 resize-y font-mono`;

// Se escribe entero en vez de agregarle un ancho a INPUT_CLASSES: las dos serian utilidades de
// width y gana la que Tailwind emita mas tarde en el CSS, no la que este despues en el string.
// w-full sale despues de w-32, asi que agregarlo no hacia nada y el input se comia la fila.
export const DATE_INPUT_CLASSES: string =
  "w-28 shrink-0 rounded-md border border-border bg-field px-2 py-1 text-right text-xs tabular-nums text-fg outline-none focus:border-brand-border";

export const HINT_CLASSES: string = "text-[11px] text-fg-subtle";

export const ERROR_CLASSES: string = "text-[11px] text-red-600 dark:text-red-400";

export const ACTION_CLASSES: string =
  "shrink-0 text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover";

export const BADGE_LOADED_CLASSES: string =
  "rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300";

export const BADGE_EMPTY_CLASSES: string =
  "rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-fg-subtle";

// Un ano al que le faltan fechas es la falla que de otro modo aparece recien el dia que alguien
// consulta justo el periodo que falta, asi que se avisa donde se ve la tabla.
export const BADGE_PARCIAL_CLASSES: string =
  "rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300";

export const DECLARACIONES: { kind: DeclaracionKind; label: string }[] = [
  { kind: "ica", label: "Industria y Comercio" },
  { kind: "reteica", label: "Retención (ReteICA)" },
  { kind: "autoretencionIca", label: "Autorretención" },
];

export const PERIODICIDAD_LABEL: Record<string, string> = {
  anual: "Anual",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  mensual: "Mensual",
};

export const DIGITO_LABEL: Record<string, string> = {
  ninguno: "sin dígito",
  primer_digito: "por primer dígito",
  ultimo_digito: "por último dígito",
};

export const PASTE_PLACEHOLDER: string =
  '{ "municipioId": 1, "ica": [ { "anio": 2024, "periodicidad": "anual", "tipoDigito": "ninguno", "fechas": [ { "periodo": 1, "fecha": "2025/03/31" } ] } ], "reteica": [], "autoretencionIca": [] }';
