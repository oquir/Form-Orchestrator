import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function IconButton({ className = "", children, ...rest }: IconButtonProps) {
  return (
    <button type="button" className={className} {...rest}>
      {children}
    </button>
  );
}
