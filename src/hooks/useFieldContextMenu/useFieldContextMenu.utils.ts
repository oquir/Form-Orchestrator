import {
  MENU_MAX_HEIGHT_RATIO,
  MENU_MIN_HEIGHT_PX,
  MENU_WIDTH_PX,
  VIEWPORT_MARGIN_PX,
} from "./useFieldContextMenu.constants";
import type { FieldContextMenuPosition } from "./useFieldContextMenu.types";

// Coloca el menu como un menu contextual de Windows: nace con una esquina en el puntero y, si del
// lado por defecto no cabe, se voltea (flip) en vez de correrse. Correrlo lo despegaba del clic:
// cerca del borde inferior el menu subia hasta tapar el punto donde se habia abierto.
export function getMenuPosition(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
): FieldContextMenuPosition {
  const opensRight: boolean = x + MENU_WIDTH_PX + VIEWPORT_MARGIN_PX <= viewportWidth;
  const anchoredLeft: number = opensRight ? x : x - MENU_WIDTH_PX;
  // Si tampoco cabe volteado (ventana angosta, clic cerca del centro) queda pegado al margen.
  const left: number = Math.max(
    VIEWPORT_MARGIN_PX,
    Math.min(anchoredLeft, viewportWidth - MENU_WIDTH_PX - VIEWPORT_MARGIN_PX),
  );

  // El alto real depende de la pestana y no se conoce antes de pintar, asi que no se compara el
  // alto completo como hace Windows: abre hacia abajo mientras quepa el minimo utilizable, y si no,
  // hacia el lado con mas espacio. Hacia arriba se ancla con bottom, asi el borde inferior queda en
  // el puntero sea cual sea el alto que termine teniendo.
  const spaceBelow: number = viewportHeight - y - VIEWPORT_MARGIN_PX;
  const spaceAbove: number = y - VIEWPORT_MARGIN_PX;
  const opensDown: boolean = spaceBelow >= MENU_MIN_HEIGHT_PX || spaceBelow >= spaceAbove;
  const heightCap: number = viewportHeight * MENU_MAX_HEIGHT_RATIO;

  return {
    left,
    top: opensDown ? y : undefined,
    bottom: opensDown ? undefined : viewportHeight - y,
    width: MENU_WIDTH_PX,
    maxHeight: Math.min(heightCap, opensDown ? spaceBelow : spaceAbove),
  };
}
