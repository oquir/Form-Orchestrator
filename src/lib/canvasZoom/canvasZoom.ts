import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP, ZOOM_WHEEL_FACTOR } from "../../constants/canvasZoom";

// Aritmetica del zoom del lienzo. Todo es puro salvo getCanvasScale, que lee el DOM a proposito:
// el zoom se aplica en CSS, asi que el DOM es la unica fuente de verdad de cuanto vale.

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return ZOOM_MIN;

  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

// Se redondea a dos decimales porque el paso es 0,1 y la suma binaria da 0.7000000000000001, que
// se pinta bien como "70%" pero nunca es igual a 0.7 al comparar contra el tope.
export function zoomIn(zoom: number): number {
  return clampZoom(Math.round((zoom + ZOOM_STEP) * 100) / 100);
}

export function zoomOut(zoom: number): number {
  return clampZoom(Math.round((zoom - ZOOM_STEP) * 100) / 100);
}

// La rueda es continua y no a pasos: el pellizco de un trackpad manda muchos eventos chicos y
// saltar 0,1 en cada uno lo mandaria a los topes antes de levantar los dedos.
export function wheelZoom(zoom: number, deltaY: number): number {
  return clampZoom(zoom * (1 - deltaY * ZOOM_WHEEL_FACTOR));
}

export function canZoomIn(zoom: number): boolean {
  return zoom < ZOOM_MAX;
}

export function canZoomOut(zoom: number): boolean {
  return zoom > ZOOM_MIN;
}

export function formatZoom(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}

// rect.width sale de getBoundingClientRect y ya viene escalado; offsetWidth es el ancho de
// maquetacion y las transformaciones no lo tocan. Su cociente es la escala acumulada de todos los
// ancestros.
//
// Se lee del elemento y no del store para que la matematica del arrastre no dependa de un valor que
// hay que acordarse de pasar, y para que devuelva exactamente 1 cuando no hay zoom.
//
// offsetWidth es entero, asi que la escala sale con un error del orden del 0,05%. Una columna mide
// unos 50 px: es despreciable y no hay que corregirlo.
export function getCanvasScale(element: HTMLElement | null): number {
  if (!element) return 1;

  const layoutWidth: number = element.offsetWidth;
  if (layoutWidth === 0) return 1;

  return element.getBoundingClientRect().width / layoutWidth;
}
