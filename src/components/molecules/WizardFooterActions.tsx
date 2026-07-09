import type { ReactNode } from "react";

interface WizardFooterActionsProps {
  children: ReactNode;
  justify?: "end" | "between";
  className?: string;
}

export function WizardFooterActions({
  children,
  justify = "between",
  className = "",
}: WizardFooterActionsProps) {
  return (
    <div
      className={`flex ${justify === "between" ? "justify-between" : "justify-end"} ${className}`}
    >
      {children}
    </div>
  );
}
