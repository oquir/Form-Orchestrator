import type { TextareaHTMLAttributes } from "react";

type TextareaVariant = "default" | "code";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
}

const VARIANT_CLASSES: Record<TextareaVariant, string> = {
  default: "px-2.5 py-1.5 text-sm text-slate-700 dark:bg-neutral-800 dark:text-neutral-200",
  code: "px-3 py-2 font-mono text-xs text-slate-100 bg-slate-900 dark:bg-neutral-950",
};

export function Textarea({ className = "", variant = "default", ...rest }: TextareaProps) {
  return (
    <textarea
      className={`w-full resize-y rounded-md border border-slate-200 focus:border-orange-500 focus:outline-none dark:border-neutral-700 dark:focus:border-orange-400 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
