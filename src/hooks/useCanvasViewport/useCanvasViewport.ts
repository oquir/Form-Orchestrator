import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getViewportLayout } from "../../lib/canvasViewport/canvasViewport";
import { wheelZoom } from "../../lib/canvasZoom/canvasZoom";
import { useFormStore } from "../../store/formStore";
import type { ViewportLayout } from "../../types/canvasViewport";
import type { CanvasViewportReturn } from "../../types/canvasViewportReturn";
import type { HomedView, PortSize, ViewAnchor } from "./useCanvasViewport.types";
import {
  captureAnchor,
  readPortSize,
  restoreAnchor,
  samePortSize,
} from "./useCanvasViewport.utils";

// El lado DOM del lienzo libre: mide el puerto, dimensiona la raiz con su margen de paneo, aplica la
// escala del zoom, escucha la rueda, vuelve al inicio al cambiar de paso y mantiene en el centro lo
// que ya estaba en el centro cuando cambian el zoom o el tamano del puerto. Las cuentas estan en
// lib/canvasViewport y lib/canvasZoom; aca solo vive lo que necesita medir el navegador.
//
// El margen negativo no es cosmetico. Un transform no cambia la maquetacion: la caja sigue midiendo
// H aunque se pinte a H x k. Sin compensar, al alejar sobran H x (1 - k) pixeles de scroll muerto
// al final, y al acercar el fondo del formulario se sale de la zona con scroll y NO HAY FORMA DE
// LLEGAR A EL. marginBottom es negativo cuando k < 1 y positivo cuando k > 1, y en los dos casos
// deja la caja de flujo ocupando exactamente lo que se ve.
export function useCanvasViewport(): CanvasViewportReturn {
  const zoom: number = useFormStore((state) => state.canvasZoom);
  const canvasKey: string = useFormStore(
    (state) => `${state.activeCanvas.type}:${state.activeCanvas.stepId}`,
  );
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const [portSize, setPortSize] = useState<PortSize | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const portSizeRef = useRef<PortSize | null>(null);
  const pendingAnchor = useRef<ViewAnchor | null>(null);
  const previousZoom = useRef<number>(zoom);
  const homed = useRef<HomedView | null>(null);

  const port: HTMLElement | null = useMemo(
    () => content?.closest<HTMLElement>("[data-canvas-scroll]") ?? null,
    [content],
  );

  // En un efecto de layout y no en uno comun: la medida llega antes de pintar, asi que nunca se ve
  // un frame con la raiz sin dimensionar.
  useLayoutEffect(() => {
    if (!port) return;

    const initial: PortSize = readPortSize(port);
    portSizeRef.current = initial;
    setPortSize(initial);

    const observer = new ResizeObserver(() => {
      const next: PortSize = readPortSize(port);
      if (samePortSize(portSizeRef.current, next)) return;

      // Plegar el sidebar o redimensionar la ventana cambia el ancho de la raiz, y con el la
      // posicion del documento. Se guarda lo que se estaba mirando antes de que la raiz se rehaga;
      // si ya habia un ancla pendiente se conserva, porque es la de antes de que empezara el cambio.
      if (content && pendingAnchor.current === null) {
        pendingAnchor.current = captureAnchor(port, content);
      }

      portSizeRef.current = next;
      setPortSize(next);
    });

    observer.observe(port);

    return () => observer.disconnect();
  }, [port, content]);

  // No hay bucle: offsetHeight es la caja de borde, no incluye margenes, y un transform tampoco la
  // cambia. contentHeight solo se mueve cuando cambian las filas o el ancho del documento.
  useEffect(() => {
    if (!content) return;

    const observer = new ResizeObserver(() => {
      const next: number = content.offsetHeight;
      setContentHeight((current) => (current === next ? current : next));
    });

    observer.observe(content);

    return () => observer.disconnect();
  }, [content]);

  // passive: false porque hay que quitarle el evento al navegador: sin preventDefault, Ctrl+rueda
  // hace su propio zoom de pagina, que aca no sirve porque la app es una pantalla fija y lo que se
  // quiere acercar es el lienzo, no el cromo. Se escucha en el puerto y no en el documento para que
  // el gesto funcione tambien sobre el margen. El zoom se lee con getState para no volver a montar
  // el listener en cada rueda.
  useEffect(() => {
    if (!port) return;

    function handleWheel(event: WheelEvent): void {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();

      const state = useFormStore.getState();
      state.setCanvasZoom(wheelZoom(state.canvasZoom, event.deltaY));
    }

    port.addEventListener("wheel", handleWheel, { passive: false });

    return () => port.removeEventListener("wheel", handleWheel);
  }, [port]);

  // Se mide con los rects de ANTES del cambio: en el momento de calcularlo el DOM todavia no tiene el
  // transform nuevo. No mover esto a un efecto: para cuando corre, los rects ya cambiaron y no hay
  // nada que anclar. Se ancla al centro de la vista y no al cursor: el zoom tambien llega por el
  // teclado y por el menu, donde el cursor no esta sobre el lienzo.
  if (previousZoom.current !== zoom) {
    if (content && port) pendingAnchor.current = captureAnchor(port, content);
    previousZoom.current = zoom;
  }

  const layout: ViewportLayout | null = portSize
    ? getViewportLayout({ portWidth: portSize.width, portHeight: portSize.height, zoom })
    : null;

  // Despues del commit: antes, la raiz todavia tiene el tamano viejo y el navegador recortaria el
  // scroll que le pidamos. zoom y portSize van como disparadores a proposito: el efecto tiene que
  // correr justo despues del commit que siguio a la captura del ancla.
  // biome-ignore lint/correctness/useExhaustiveDependencies: zoom y portSize son disparadores, no datos leidos
  useLayoutEffect(() => {
    const anchor: ViewAnchor | null = pendingAnchor.current;
    if (!anchor || !content || !port) return;

    pendingAnchor.current = null;
    restoreAnchor(port, content, anchor);
  }, [zoom, portSize, content, port]);

  // Vuelta al inicio al montar la vista lienzo y al cambiar de paso. Sin esto, pasar de un paso largo
  // a uno corto dejaria la vista flotando en el margen vacio. Va despues del ancla a proposito: si
  // los dos coinciden en el mismo commit, manda la vuelta al inicio.
  useLayoutEffect(() => {
    if (!layout || !content || !port) return;
    if (homed.current?.content === content && homed.current.canvasKey === canvasKey) return;

    homed.current = { content, canvasKey };
    pendingAnchor.current = null;
    port.scrollTo({ left: layout.homeLeft, top: layout.homeTop });
  }, [layout, content, port, canvasKey]);

  const rootStyle: CSSProperties | undefined = layout
    ? {
        width: layout.rootWidth,
        minHeight: layout.rootMinHeight,
        paddingTop: layout.paddingTop,
        paddingBottom: layout.paddingBottom,
      }
    : undefined;

  // A escala 1 no se emite ni transform ni margen: un scale(1) inocente igual crearia un bloque
  // contenedor y un contexto de apilamiento. El ancho va siempre: la raiz es mas ancha que el puerto,
  // asi que el documento ya no puede tomar el suyo de ella.
  const contentStyle: CSSProperties =
    zoom === 1
      ? { width: layout?.documentWidth }
      : {
          width: layout?.documentWidth,
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          marginBottom: contentHeight * (zoom - 1),
        };

  return { contentRef: setContent, rootStyle, contentStyle };
}
