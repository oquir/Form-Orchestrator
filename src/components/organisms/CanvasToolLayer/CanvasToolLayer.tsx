import { useCanvasMarquee } from "../../../hooks/useCanvasMarquee/useCanvasMarquee";
import { useCanvasPan } from "../../../hooks/useCanvasPan/useCanvasPan";
import { useFormStore } from "../../../store/formStore";
import type { SelectionRect } from "../../../types/canvasSelection";
import { MARQUEE_CLASSES } from "./CanvasToolLayer.constants";

// Monta la mano y el marco y dibuja el rectangulo. Vive aparte de Canvas para que el marco, que
// cambia en cada movimiento del puntero, redibuje solo este nodo y no el lienzo entero.
export function CanvasToolLayer() {
  const canvasTool = useFormStore((state) => state.canvasTool);
  const marquee: SelectionRect | null = useCanvasMarquee(canvasTool === "select");

  useCanvasPan(canvasTool === "hand");

  if (!marquee) return null;

  return (
    <div
      aria-hidden
      className={MARQUEE_CLASSES}
      style={{
        left: marquee.left,
        top: marquee.top,
        width: Math.max(0, marquee.right - marquee.left),
        height: Math.max(0, marquee.bottom - marquee.top),
      }}
    />
  );
}
