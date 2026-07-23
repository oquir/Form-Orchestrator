import { GRID_GAP_PX } from "../useFieldResize/useFieldResize.constants";

export function getRowElement(rowId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-row-id="${rowId}"]`);
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
