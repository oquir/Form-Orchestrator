export const SAVE_BUTTON_BASE_CLASSES: string =
  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors";

export const SAVE_BUTTON_STATE_CLASSES: Record<"saved" | "idle", string> = {
  saved:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:cursor-not-allowed",
  idle: "border-border text-fg-soft hover:border-border-strong hover:text-fg-strong hover:cursor-pointer",
};
