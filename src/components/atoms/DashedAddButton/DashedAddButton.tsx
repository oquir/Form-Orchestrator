import type { DashedAddButtonProps } from "./DashedAddButton.types";

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
