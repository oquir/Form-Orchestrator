import type { ButtonHTMLAttributes, ReactNode } from "react";

interface DashedAddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function DashedAddButton({ className = "", children, ...rest }: DashedAddButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-md border border-dashed text-xs font-medium transition-colors hover:cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
