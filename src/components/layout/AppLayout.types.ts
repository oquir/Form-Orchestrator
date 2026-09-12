import type { ReactNode } from "react";

export interface AppLayoutProps {
  sidebar: ReactNode;
  canvas: ReactNode;
  // Lo que flota sobre el lienzo sin desplazarse ni escalarse con el: la barra de herramientas.
  canvasOverlay?: ReactNode;
  rightSidebar: ReactNode;
}
