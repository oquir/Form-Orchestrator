import type { CollisionDetection, Modifier } from "@dnd-kit/core";
import { pointerWithin, rectIntersection } from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";
import { GRID_GAP_PX } from "../../constants/grid";
import type {
  CanvasTarget,
  DragPlacement,
  RowDragState,
  RowDropEdge,
  RowDropTarget,
} from "../../types/placement";

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

// Manda el puntero, y solo si no esta sobre nada se cae al solape de rectangulos.
//
// La deteccion por rectangulos de dnd-kit compara el rectangulo del overlay con el de cada zona, y
// desde que se arrastra la fila entera ese rectangulo mide lo que la fila: al subirlo a las
// pestanas las tapa todas de una vez. Para una pestana enteramente cubierta el cociente se reduce
// a suArea/areaDelOverlay, asi que ganaba la pestana mas ancha de las tapadas y el puntero no
// pintaba nada. El respaldo por rectangulos se conserva porque perdona los huecos entre filas,
// donde el puntero no esta dentro de ninguna.
export const pointerFirstCollision: CollisionDetection = (args) => {
  const byPointer = pointerWithin(args);

  return byPointer.length > 0 ? byPointer : rectIntersection(args);
};

export function sameCanvasTarget(a: CanvasTarget | null, b: CanvasTarget | null): boolean {
  if (a === null || b === null) return a === b;

  return a.type === b.type && a.stepId === b.stepId;
}

export function getRowElement(rowId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-row-id="${rowId}"]`);
}

export function getBandElement(groupId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-band-id="${groupId}"]`);
}

// Se mide al empezar el arrastre y no despues: en cuanto las demas filas empiezan a apartarse, el
// alto que hay que dejar libre es el que la fila tenia antes de que nada se moviera.
export function measureRow(rowId: string): RowDragState | null {
  const element: HTMLElement | null = getRowElement(rowId);
  if (!element) return null;

  const rect: DOMRect = element.getBoundingClientRect();

  return { rowId, width: rect.width, height: rect.height };
}

// Por que mitad del elemento cae el puntero. Es el gemelo en Y de getColumnAtPointer: al reordenar
// filas la unica pregunta es si la fila arrastrada va encima o debajo de la que hay debajo del
// cursor, y eso lo decide el punto medio.
export function getDropEdgeAtPointer(element: HTMLElement, pointerY: number): RowDropEdge {
  const rect: DOMRect = element.getBoundingClientRect();

  return pointerY < rect.top + rect.height / 2 ? "before" : "after";
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

// Por valor y por la misma razon que samePlacement: se recalcula en cada movimiento del puntero.
export function sameRowDropTarget(a: RowDropTarget | null, b: RowDropTarget | null): boolean {
  if (a === null || b === null) return a === b;

  return a.rowId === b.rowId && a.edge === b.edge && a.isValid === b.isValid;
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
