import { VARIANT_CLASSES } from "./TextArea.constants";
import type { TextareaProps } from "./Textarea.types";

export function Textarea({ className = "", variant = "default", ...rest }: TextareaProps) {
  return (
    <textarea
      className={`w-full resize-y rounded-md border border-slate-200 focus:border-orange-500 focus:outline-none dark:border-neutral-700 dark:focus:border-orange-400 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
