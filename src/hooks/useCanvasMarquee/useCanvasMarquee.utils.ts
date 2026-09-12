import type { SelectionRect } from "../../types/canvasSelection";
import type { ScrollPoint } from "./useCanvasMarquee.types";

// Cuanto hay que sumarle a una coordenada de la ventana para llevarla al espacio de scroll del
// puerto. Se calcula una vez por movimiento y no una vez por campo.
export function scrollOffset(port: HTMLElement): ScrollPoint {
  const portRect: DOMRect = port.getBoundingClientRect();

  return { x: port.scrollLeft - portRect.left, y: port.scrollTop - portRect.top };
}

export function shiftRect(rect: SelectionRect, offset: ScrollPoint): SelectionRect {
  return {
    left: rect.left + offset.x,
    top: rect.top + offset.y,
    right: rect.right + offset.x,
    bottom: rect.bottom + offset.y,
  };
}

// El marco se dibuja fixed y fuera del puerto: sin recortarlo pintaria encima de los paneles cuando
// el puntero sale del lienzo arrastrando.
export function clipToPort(port: HTMLElement, rect: SelectionRect): SelectionRect {
  const portRect: DOMRect = port.getBoundingClientRect();

  return {
    left: Math.max(rect.left, portRect.left),
    top: Math.max(rect.top, portRect.top),
    right: Math.min(rect.right, portRect.left + port.clientWidth),
    bottom: Math.min(rect.bottom, portRect.top + port.clientHeight),
  };
}
