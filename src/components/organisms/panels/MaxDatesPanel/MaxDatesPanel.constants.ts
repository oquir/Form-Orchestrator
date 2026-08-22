import type { DeclaracionKind } from "../../../../types/maxDates";

export const INPUT_CLASSES: string =
  "w-full rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const HINT_CLASSES: string = "text-[11px] text-fg-subtle";

export const ACTION_CLASSES: string =
  "shrink-0 text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover";

export const BADGE_LOADED_CLASSES: string =
  "rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300";

export const BADGE_EMPTY_CLASSES: string =
  "rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-fg-subtle";

export const DECLARACIONES: { kind: DeclaracionKind; label: string }[] = [
  { kind: "ica", label: "Industria y Comercio" },
  { kind: "reteica", label: "Retención (ReteICA)" },
  { kind: "autoretencionIca", label: "Autorretención" },
];
