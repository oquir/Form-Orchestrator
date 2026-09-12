export interface PortSize {
  width: number;
  height: number;
}

// Un punto del documento en pixeles de maquetacion, medido desde su esquina superior izquierda.
export interface ViewAnchor {
  x: number;
  y: number;
}

// Para que documento y que paso se hizo la ultima vuelta al inicio.
export interface HomedView {
  content: HTMLDivElement;
  canvasKey: string;
}
