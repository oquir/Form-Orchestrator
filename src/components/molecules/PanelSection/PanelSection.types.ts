import type { ReactNode } from "react";

export interface PanelSectionProps {
  title: string;
  // Va a la derecha del titulo. Una insignia, un contador, o el control que enciende y apaga toda
  // la seccion: nunca uno de los que hay dentro, o se leeria como si valiera solo para el primero.
  aside?: ReactNode;
  children: ReactNode;
}
