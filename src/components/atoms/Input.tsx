import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", disabled, ...rest }: InputProps) {
  return (
    <input
      disabled={disabled}
      className={`w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:focus:border-orange-400 ${
        disabled
          ? "bg-slate-50 text-slate-400 dark:text-slate-500"
          : "text-slate-700 dark:text-slate-200"
      } ${className}`}
      {...rest}
    />
  );
}
