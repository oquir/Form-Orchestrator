import type { ButtonVariant } from "./Button.types";

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "border border-border text-fg-soft hover:border-border-strong hover:text-fg-strong",
  ghost: "text-fg-muted hover:bg-surface-raised",
};
