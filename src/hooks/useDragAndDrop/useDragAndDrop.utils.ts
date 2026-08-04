import type { Modifier } from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";
import { GRID_GAP_PX } from "../../constants/grid";
import type { DragPlacement } from "../../types/placement";

// Medidas del arrastre contra el DOM real. La grilla la dibuja CSS, asi que la unica forma de
// saber sobre que columna esta el puntero es medir la fila.

// Centra la previsualizacion en el cursor. Sin esto el elemento arrastrado conserva el punto por
// donde se agarro, y al soltar cerca de un borde se coloca en una columna distinta de la que se ve.
export const centerOverlayOnCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  if (!activatorEvent || !draggingNodeRect) return transform;

  const coordinates = getEventCoordinates(activatorEvent);
  if (!coordinates) return transform;

  const rect = overlayNodeRect ?? draggingNodeRect;
  const grabOffsetX: number = coordinates.x - draggingNodeRect.left;
  const grabOffsetY: number = coordinates.y - draggingNodeRect.top;

  return {
    ...transform,
    x: transform.x + grabOffsetX - rect.width / 2,
    y: transform.y + grabOffsetY - rect.height / 2,
  };
};

export function getRowElement(rowId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-row-id="${rowId}"]`);
}

// Comparacion por valor: el placement se recalcula en cada movimiento del puntero y sale un objeto
// nuevo aunque la columna no haya cambiado, asi que por identidad nunca coincidirian.
export function samePlacement(a: DragPlacement | null, b: DragPlacement | null): boolean {
  if (a === null || b === null) return a === b;

  return (
    a.rowId === b.rowId &&
    a.colStart === b.colStart &&
    a.colSpan === b.colSpan &&
    a.mode === b.mode &&
    a.isValid === b.isValid
  );
}

export function getColumnAtPointer(
  rowElement: HTMLElement,
  columns: number,
  pointerX: number,
): number {
  const rect: DOMRect = rowElement.getBoundingClientRect();
  const styles: CSSStyleDeclaration = window.getComputedStyle(rowElement);
  const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
  const usableWidth = rect.width - paddingLeft - paddingRight;
  const perColumn = (usableWidth - (columns - 1) * GRID_GAP_PX) / columns;
  if (perColumn <= 0) return 1;

  const offsetX = pointerX - rect.left - paddingLeft;
  const column = Math.floor(offsetX / (perColumn + GRID_GAP_PX)) + 1;

  return Math.max(1, Math.min(columns, column));
}
