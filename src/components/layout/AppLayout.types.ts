import type { ReactNode } from "react";

export interface AppLayoutProps {
  sidebar: ReactNode;
  canvas: ReactNode;
  // Lo que flota sobre el lienzo sin desplazarse ni escalarse con el: la barra de herramientas y,
  // con el panel derecho plegado, el chip que lo reemplaza.
  canvasOverlay?: ReactNode;
  rightSidebar: ReactNode;
}
