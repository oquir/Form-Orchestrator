import type { CanvasRow } from "../../../types/formStructure";
import type { CanvasBlock } from "./CanvasRowsGrid.types";

export function toCanvasBlocks(rows: CanvasRow[]): CanvasBlock[] {
  const blocks: CanvasBlock[] = [];

  for (const row of rows) {
    if (row.groupId === undefined) {
      blocks.push({ kind: "row", row });
      continue;
    }

    const last: CanvasBlock | undefined = blocks[blocks.length - 1];

    if (last?.kind === "group" && last.groupId === row.groupId) {
      last.rows.push(row);
      continue;
    }

    blocks.push({ kind: "group", groupId: row.groupId, rows: [row] });
  }

  return blocks;
}
