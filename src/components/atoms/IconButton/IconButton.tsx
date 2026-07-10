import type { IconButtonProps } from "./IconButton.types";

export function IconButton({ className = "", children, ...rest }: IconButtonProps) {
  return (
    <button type="button" className={className} {...rest}>
      {children}
    </button>
  );
}
