import type { InputProps } from "../../../types/input";

export function Input({ className = "", disabled, tone = "default", ...rest }: InputProps) {
  const toneClasses: string = disabled
    ? "bg-slate-50 text-slate-400 dark:text-neutral-500"
    : tone === "code"
      ? "font-mono text-brand-fg"
      : "text-slate-700 dark:text-neutral-200";

  return (
    <input
      disabled={disabled}
      className={`w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:border-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-orange-400 ${toneClasses} ${className}`}
      {...rest}
    />
  );
}
