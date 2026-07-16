import { CanvasRow } from "../CanvasRow/CanvasRow";
import type { CanvasRowsGridProps } from "./CanvasRowsGrid.types";

export function CanvasRowsGrid({ rows, onFieldContextMenu }: CanvasRowsGridProps) {
  return (
    <ul className="grid list-none grid-cols-16 content-start gap-3">
      {rows.map((row) => (
        <CanvasRow key={row.id} row={row} onFieldContextMenu={onFieldContextMenu} />
      ))}
    </ul>
  );
}
