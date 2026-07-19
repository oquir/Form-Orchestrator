import type { ReactNode } from "react";

export interface WizardFooterActionsProps {
  children: ReactNode;
  justify?: "end" | "between";
  className?: string;
}
