import type { JsonTokenKind } from "./JsonCode.types";

export const JSON_TOKEN_CLASSES: Record<JsonTokenKind, string> = {
  key: "text-sky-600 dark:text-sky-400",
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-orange-600 dark:text-orange-400",
  boolean: "text-amber-600 dark:text-amber-400",
  null: "text-slate-400 dark:text-neutral-500",
};

export const JSON_MUTED_CLASS: string = "text-slate-400 dark:text-neutral-500";

export const JSON_CODE_BASE_CLASSES: string =
  "overflow-auto font-mono text-xs leading-relaxed text-slate-500 dark:text-neutral-400";
