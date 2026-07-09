import type { TextareaHTMLAttributes } from "react";

type TextareaVariant = "default" | "code";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
}

const VARIANT_CLASSES: Record<TextareaVariant, string> = {
  default: "px-2.5 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  code: "px-3 py-2 font-mono text-xs text-slate-100 bg-slate-900 dark:bg-slate-950",
};

export function Textarea({ className = "", variant = "default", ...rest }: TextareaProps) {
  return (
    <textarea
      className={`w-full resize-y rounded-md border border-slate-200 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:focus:border-slate-500 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
