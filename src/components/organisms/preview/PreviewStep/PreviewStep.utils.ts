import type { ExportedRow } from "../../../../types/exportForm";
import type { PreviewBlock } from "./PreviewStep.types";

export function toPreviewBlocks(rows: ExportedRow[]): PreviewBlock[] {
  const blocks: PreviewBlock[] = [];

  for (const row of rows) {
    const last: PreviewBlock | undefined = blocks[blocks.length - 1];

    if (!row.groupId) {
      if (last?.kind === "rows") last.rows.push(row);
      else blocks.push({ kind: "rows", rows: [row] });
      continue;
    }

    if (last?.kind === "group" && last.groupId === row.groupId) {
      last.rows.push(row);
      continue;
    }

    blocks.push({ kind: "group", groupId: row.groupId, rows: [row] });
  }

  return blocks;
}
