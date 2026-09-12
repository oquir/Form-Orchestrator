import { getCanvasScale } from "../../lib/canvasZoom/canvasZoom";
import type { PortSize, ViewAnchor } from "./useCanvasViewport.types";

// clientWidth y clientHeight y no el rect: sin la barra de scroll, que es lo que de verdad se ve.
export function readPortSize(port: HTMLElement): PortSize {
  return { width: port.clientWidth, height: port.clientHeight };
}

export function samePortSize(a: PortSize | null, b: PortSize): boolean {
  return a !== null && a.width === b.width && a.height === b.height;
}

// Que punto del documento esta bajo el centro de la vista. Se divide por la escala leida del DOM y
// no por el zoom del store: asi da igual si el transform nuevo ya se aplico, y el punto queda en
// pixeles de maquetacion, que son los unicos que el zoom no cambia.
export function captureAnchor(port: HTMLElement, content: HTMLElement): ViewAnchor {
  const portRect: DOMRect = port.getBoundingClientRect();
  const rect: DOMRect = content.getBoundingClientRect();
  const scale: number = getCanvasScale(content);

  return {
    x: (portRect.left + port.clientWidth / 2 - rect.left) / scale,
    y: (portRect.top + port.clientHeight / 2 - rect.top) / scale,
  };
}

// Devuelve ese punto al centro de la vista con los rects de despues del cambio. Corrige X ademas de
// Y porque el borde izquierdo del documento ahora si se mueve: la raiz cambia de ancho con el zoom y
// con el puerto, y el documento va centrado en ella.
export function restoreAnchor(port: HTMLElement, content: HTMLElement, anchor: ViewAnchor): void {
  const portRect: DOMRect = port.getBoundingClientRect();
  const rect: DOMRect = content.getBoundingClientRect();
  const scale: number = getCanvasScale(content);

  port.scrollLeft += rect.left + anchor.x * scale - (portRect.left + port.clientWidth / 2);
  port.scrollTop += rect.top + anchor.y * scale - (portRect.top + port.clientHeight / 2);
}
