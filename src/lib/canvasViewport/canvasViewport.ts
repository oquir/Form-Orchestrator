import {
  CANVAS_PAN_ROOM_RATIO,
  DOCUMENT_GUTTER_PX,
  DOCUMENT_MAX_WIDTH_PX,
  DOCUMENT_VERTICAL_GUTTER_PX,
} from "../../constants/canvasViewport";
import type { ViewportInput, ViewportLayout } from "../../types/canvasViewport";

// Geometria del lienzo libre: cuanto mide el documento, cuanto margen de paneo lo rodea y donde
// queda la vista al volver al inicio. Solo hace cuentas; medir el puerto y aplicar el resultado es
// cosa de useCanvasViewport.
//
// El margen es scroll de verdad y no un translate propio: la rueda, el trackpad, las barras y el
// autoscroll de dnd-kit siguen funcionando, y dnd-kit no tiene que volver a medir nada.
export function getViewportLayout({
  portWidth,
  portHeight,
  zoom,
}: ViewportInput): ViewportLayout | null {
  if (portWidth <= 0 || portHeight <= 0) return null;

  const documentWidth: number = Math.max(
    0,
    Math.min(DOCUMENT_MAX_WIDTH_PX, portWidth - 2 * DOCUMENT_GUTTER_PX),
  );
  const panX: number = Math.round(portWidth * CANVAS_PAN_ROOM_RATIO);
  const panY: number = Math.round(portHeight * CANVAS_PAN_ROOM_RATIO);
  // La franja donde vive el documento: el puerto entero si el documento entra, o el documento
  // escalado con su aire si el zoom lo hace mas ancho. De ahi para afuera empieza el margen.
  const stageWidth: number = Math.max(portWidth, documentWidth * zoom + 2 * DOCUMENT_GUTTER_PX);
  const rootWidth: number = Math.round(stageWidth + 2 * panX);
  const padding: number = DOCUMENT_VERTICAL_GUTTER_PX + panY;

  return {
    documentWidth,
    rootWidth,
    // Sin este piso, un documento corto a zoom bajo no dejaria scroll suficiente para llegar a la
    // posicion de inicio y la vista quedaria recortada contra el final.
    rootMinHeight: portHeight + 2 * panY,
    paddingTop: padding,
    paddingBottom: padding,
    homeLeft: Math.round((rootWidth - portWidth) / 2),
    homeTop: panY,
  };
}
