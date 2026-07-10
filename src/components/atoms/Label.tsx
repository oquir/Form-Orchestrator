import type { LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...rest }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: reusable wrapper â€” callers supply htmlFor/children
    <label
      className={`mb-1 block text-xs font-medium text-slate-500 dark:text-neutral-400 ${className}`}
      {...rest}
    />
  );
}
