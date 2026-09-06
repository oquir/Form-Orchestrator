import type { ReactNode } from "react";

export interface PanelBlockProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}
