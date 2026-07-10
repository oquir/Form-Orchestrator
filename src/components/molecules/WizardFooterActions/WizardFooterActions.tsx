import type { WizardFooterActionsProps } from "./WizardFooterActions.types";

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
