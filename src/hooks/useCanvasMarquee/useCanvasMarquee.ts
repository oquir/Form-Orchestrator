import { useEffect, useState } from "react";
import { getCanvasScrollPort, getFieldElements } from "../../lib/canvasDom/canvasDom";
import {
  mergeIds,
  normalizeRect,
  pointInRect,
  rectsIntersect,
} from "../../lib/canvasSelection/canvasSelection";
import { useFormStore } from "../../store/formStore";
import type { SelectionRect } from "../../types/canvasSelection";
import { MARQUEE_ACTIVATION_PX } from "./useCanvasMarquee.constants";
import type { MarqueeGesture, ScrollPoint } from "./useCanvasMarquee.types";
import { clipToPort, scrollOffset, shiftRect } from "./useCanvasMarquee.utils";

// El marco de la seleccion multiple. En este modo todo suma: un clic en un campo lo agrega o lo
// quita, el marco agrega lo que toca y un clic en el vacio limpia. Arrastrar desde encima de un
// campo tambien abre un marco, porque el documento esta inerte y desde aca ningun campo se mueve.
//
// El marco vive en el espacio de scroll del puerto: ahi un punto del documento no se mueve cuando
// la rueda desplaza a mitad del gesto, asi que la esquina de origen queda pegada a lo que se pulso.
// Devuelve el rectangulo a dibujar en coordenadas de la ventana, ya recortado al puerto, o null.
export function useCanvasMarquee(enabled: boolean): SelectionRect | null {
  const [marquee, setMarquee] = useState<SelectionRect | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const found: HTMLElement | null = getCanvasScrollPort();
    if (!found) return;

    const port: HTMLElement = found;
    let gesture: MarqueeGesture | null = null;

    function update(): void {
      if (!gesture) return;

      const offset: ScrollPoint = scrollOffset(port);
      const current: ScrollPoint = { x: gesture.clientX + offset.x, y: gesture.clientY + offset.y };

      if (!gesture.active) {
        const distance: number = Math.hypot(
          current.x - gesture.origin.x,
          current.y - gesture.origin.y,
        );
        if (distance < MARQUEE_ACTIVATION_PX) return;
        gesture.active = true;
      }

      const area: SelectionRect = normalizeRect(
        gesture.origin.x,
        gesture.origin.y,
        current.x,
        current.y,
      );
      const hits: string[] = [];

      // getBoundingClientRect ya viene escalado por el zoom, igual que el marco que dibuja el
      // puntero: comparar no necesita saber cuanto vale la escala.
      for (const element of getFieldElements()) {
        const fieldId: string | undefined = element.dataset.fieldId;

        if (fieldId && rectsIntersect(area, shiftRect(element.getBoundingClientRect(), offset))) {
          hits.push(fieldId);
        }
      }

      useFormStore.getState().setFieldSelection(mergeIds(gesture.base, hits));
      setMarquee(clipToPort(port, shiftRect(area, { x: -offset.x, y: -offset.y })));
    }

    function endGesture(): void {
      if (!gesture) return;

      if (gesture.target.hasPointerCapture(gesture.pointerId)) {
        gesture.target.releasePointerCapture(gesture.pointerId);
      }
      gesture = null;
      setMarquee(null);
    }

    function handlePointerDown(event: PointerEvent): void {
      // Sobre una barra de scroll el objetivo es el puerto mismo, porque la raiz del lienzo cubre
      // todo lo demas: ahi manda la barra.
      if (event.button !== 0 || event.target === port || !(event.target instanceof Element)) return;

      const offset: ScrollPoint = scrollOffset(port);

      event.target.setPointerCapture(event.pointerId);
      gesture = {
        pointerId: event.pointerId,
        target: event.target,
        origin: { x: event.clientX + offset.x, y: event.clientY + offset.y },
        clientX: event.clientX,
        clientY: event.clientY,
        base: useFormStore.getState().selectedFieldIds,
        active: false,
      };
    }

    function handlePointerMove(event: PointerEvent): void {
      if (!gesture || event.pointerId !== gesture.pointerId) return;

      gesture.clientX = event.clientX;
      gesture.clientY = event.clientY;
      update();
    }

    function handlePointerUp(event: PointerEvent): void {
      if (!gesture || event.pointerId !== gesture.pointerId) return;

      const wasMarquee: boolean = gesture.active;
      endGesture();
      if (wasMarquee) return;

      // Sin arrastre fue un clic: el campo bajo el puntero entra o sale, y el vacio limpia. Se busca
      // por rects y no con elementsFromPoint, que ignora a los nodos con pointer-events-none.
      const hit: HTMLElement | undefined = getFieldElements().find((element) =>
        pointInRect(event.clientX, event.clientY, element.getBoundingClientRect()),
      );
      const fieldId: string | undefined = hit?.dataset.fieldId;
      const state = useFormStore.getState();

      if (fieldId) state.toggleFieldSelection(fieldId);
      else state.selectField(null);
    }

    // Escape cancela el marco y devuelve la seleccion con la que empezo. En captura y cortando la
    // propagacion: el atajo global de Escape limpia la seleccion, y aca se la quiere restaurar.
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape" || !gesture) return;

      event.preventDefault();
      event.stopPropagation();
      useFormStore.getState().setFieldSelection(gesture.base);
      endGesture();
    }

    port.addEventListener("pointerdown", handlePointerDown);
    port.addEventListener("pointermove", handlePointerMove);
    port.addEventListener("pointerup", handlePointerUp);
    port.addEventListener("pointercancel", endGesture);
    port.addEventListener("scroll", update, { passive: true });
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      endGesture();
      port.removeEventListener("pointerdown", handlePointerDown);
      port.removeEventListener("pointermove", handlePointerMove);
      port.removeEventListener("pointerup", handlePointerUp);
      port.removeEventListener("pointercancel", endGesture);
      port.removeEventListener("scroll", update);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled]);

  return marquee;
}
