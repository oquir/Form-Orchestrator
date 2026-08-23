import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { wheelZoom } from "../../lib/canvasZoom/canvasZoom";
import { useFormStore } from "../../store/formStore";
import type { CanvasZoomReturn } from "../../types/canvasZoomReturn";

// El lado DOM del zoom del lienzo: aplica la escala, compensa el alto, escucha la rueda y mantiene
// en el centro lo que ya estaba en el centro. La aritmetica esta en lib/canvasZoom; aca solo vive
// lo que necesita medir el navegador.
//
// El margen negativo no es cosmetico. Un transform no cambia la maquetacion: la caja sigue midiendo
// H aunque se pinte a H x k. Sin compensar, al alejar sobran H x (1 - k) pixeles de scroll muerto
// al final, y al acercar el fondo del formulario se sale de la zona con scroll y NO HAY FORMA DE
// LLEGAR A EL. marginBottom es negativo cuando k < 1 y positivo cuando k > 1, y en los dos casos
// deja la caja de flujo ocupando exactamente lo que se ve.
export function useCanvasZoom(): CanvasZoomReturn {
  const zoom: number = useFormStore((state) => state.canvasZoom);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const pendingScroll = useRef<number>(0);
  const previousZoom = useRef<number>(zoom);

  // Estable entre renders -solo lee un ref- para poder listarla en las dependencias de los
  // efectos de mas abajo sin que se vuelvan a montar en cada uno.
  const scrollPort = useCallback((): HTMLElement | null => {
    return contentRef.current?.closest<HTMLElement>("[data-canvas-scroll]") ?? null;
  }, []);

  // No hay bucle: offsetHeight es la caja de borde, no incluye margenes, y un transform tampoco la
  // cambia. contentHeight solo se mueve cuando se anaden o quitan filas de verdad.
  useEffect(() => {
    const element: HTMLDivElement | null = contentRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      const next: number = element.offsetHeight;
      setContentHeight((current) => (current === next ? current : next));
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // passive: false porque hay que quitarle el evento al navegador: sin preventDefault, Ctrl+rueda
  // hace su propio zoom de pagina, que aca no sirve porque la app es una pantalla fija y lo que se
  // quiere acercar es el lienzo, no el cromo. Se escucha en el elemento con scroll y no en el
  // contenido para que el gesto funcione tambien sobre el aire de los lados. El zoom se lee con
  // getState y no de la suscripcion para que el efecto no tenga que volver a montarse en cada rueda.
  useEffect(() => {
    const port: HTMLElement | null = scrollPort();
    if (!port) return;

    function handleWheel(event: WheelEvent): void {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();

      const state = useFormStore.getState();
      state.setCanvasZoom(wheelZoom(state.canvasZoom, event.deltaY));
    }

    port.addEventListener("wheel", handleWheel, { passive: false });

    return () => port.removeEventListener("wheel", handleWheel);
  }, [scrollPort]);

  // Se mide con los rects de ANTES del cambio y se guarda un delta, porque en el momento de
  // calcularlo el DOM todavia no tiene el transform nuevo. No mover esto a un useEffect: para
  // cuando el efecto corre, los rects ya cambiaron y no hay nada que anclar.
  //
  // Se ancla al centro de la ventana y no al cursor: el anclaje al cursor de Figma necesita
  // transform-origin arriba-izquierda y compensar tambien en horizontal, y esto es un documento
  // centrado que nunca scrollea en horizontal. Se mide contra el rect del contenido y no contra
  // scrollTop porque encima del lienzo hay cromo sin escalar cuyo alto no se puede multiplicar por
  // la razon de zoom.
  if (previousZoom.current !== zoom) {
    const element: HTMLDivElement | null = contentRef.current;
    const port: HTMLElement | null = scrollPort();

    if (element && port) {
      const portRect: DOMRect = port.getBoundingClientRect();
      const anchorY: number = portRect.top + portRect.height / 2;
      const offsetIntoContent: number = anchorY - element.getBoundingClientRect().top;
      const ratio: number = zoom / previousZoom.current;
      pendingScroll.current = offsetIntoContent * ratio - offsetIntoContent;
    }

    previousZoom.current = zoom;
  }

  // Se aplica despues del commit: antes, el scrollHeight todavia es el viejo y el navegador recorta
  // el scrollTop que le pidamos. zoom va en las dependencias como disparador a proposito, no como
  // un dato que el cuerpo lea: el efecto tiene que correr justo despues del commit que siguio al
  // render que calculo pendingScroll, y eso pasa exactamente cuando zoom cambia.
  // biome-ignore lint/correctness/useExhaustiveDependencies: zoom es el disparador, no un dato leido
  useLayoutEffect(() => {
    if (pendingScroll.current === 0) return;

    const port: HTMLElement | null = scrollPort();
    if (port) port.scrollTop += pendingScroll.current;
    pendingScroll.current = 0;
  }, [zoom, scrollPort]);

  // A escala 1 no se emite ni transform ni margen: el DOM queda identico al de antes de esta
  // funcionalidad. Un scale(1) inocente igual crearia un bloque contenedor y un contexto de
  // apilamiento.
  const contentStyle: CSSProperties =
    zoom === 1
      ? {}
      : {
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          marginBottom: contentHeight * (zoom - 1),
        };

  return { contentRef, contentStyle };
}
