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
  const paddingLeft: number = Number.parseFloat(styles.paddingLeft) || 0;
  const paddingRight: number = Number.parseFloat(styles.paddingRight) || 0;
  const usableWidth: number = rect.width - paddingLeft - paddingRight;
  const perColumn: number = (usableWidth - (columns - 1) * GRID_GAP_PX) / columns;
  if (perColumn <= 0) return 1;

  const offsetX: number = pointerX - rect.left - paddingLeft;
  const column: number = Math.floor(offsetX / (perColumn + GRID_GAP_PX)) + 1;
  return Math.max(1, Math.min(columns, column));
}
