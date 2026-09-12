import type { CSSProperties, RefCallback } from "react";

export interface CanvasViewportReturn {
  // Ref de callback y no de objeto: el documento se desmonta al pasar a JSON o Payload, y los
  // observadores tienen que volver a engancharse al nodo nuevo cuando vuelve.
  contentRef: RefCallback<HTMLDivElement>;
  rootStyle: CSSProperties | undefined;
  contentStyle: CSSProperties;
}
