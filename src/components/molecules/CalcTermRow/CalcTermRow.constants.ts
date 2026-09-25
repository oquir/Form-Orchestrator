import type { CalcSignChoice } from "./CalcTermRow.types";

// El menos se dibuja con el signo tipografico (U+2212): el guion comun queda corto y fino al lado
// del +, y a simple vista parece otra cosa.
export const CALC_SIGN_CHOICES: CalcSignChoice[] = [
  { sign: "+", symbol: "+", label: "Sumar" },
  { sign: "-", symbol: "−", label: "Restar" },
];

export const CYCLE_SUFFIX: string = "(ya depende de este campo)";

// Cada fila es una tarjeta como las secciones del sidebar (PanelSection): en oscuro un velo negro
// la deja apenas mas oscura que el modal, en claro va slate-100.
export const ROW_CLASSES: string =
  "flex items-center gap-3 rounded-lg border border-border bg-surface-raised p-3 transition-colors hover:border-border-strong dark:bg-black/25";

// El signo activo va relleno de naranja, no en pastilla elevada como el selector de Vista: aca
// cambia el valor que se calcula, igual que la herramienta activa del lienzo cambia lo que hace un
// clic, y pasarlo por alto es restar donde se queria sumar.
export const SIGN_TRACK_CLASSES: string =
  "flex shrink-0 gap-0.5 rounded-md border border-border bg-field p-[3px]";

export const SIGN_ITEM_BASE_CLASSES: string =
  "flex h-7 w-7 items-center justify-center rounded text-sm font-semibold transition-colors hover:cursor-pointer";

export const SIGN_ITEM_ACTIVE_CLASSES: string = "bg-brand text-on-brand shadow-sm";

export const SIGN_ITEM_INACTIVE_CLASSES: string =
  "text-fg-muted hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset";

export const SELECT_CLASSES: string =
  "h-9 w-full appearance-none rounded-md border border-border bg-field pr-9 pl-3 text-sm text-fg outline-none transition-colors hover:cursor-pointer hover:border-border-strong focus:border-brand-border";

export const SELECT_CHEVRON_CLASSES: string =
  "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle";

export const REMOVE_BUTTON_CLASSES: string =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-subtle transition-colors hover:cursor-pointer hover:bg-danger-surface hover:text-danger disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg-subtle";
