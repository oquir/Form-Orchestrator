import type { ButtonVariant } from "./Button.types";

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-orange-600 text-white hover:bg-orange-500 dark:bg-orange-500 dark:hover:bg-orange-400",
  secondary:
    "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-neutral-100",
  ghost: "text-slate-500 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
};
