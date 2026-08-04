import { useMemo } from "react";
import { buildLinkedLabelIndex } from "../../../lib/fieldKind/fieldKind";
import { getAllFields } from "../../../store/formStore";
import type { CanvasField } from "../../../types/field";
import type { RepeatableGroup } from "../../../types/formStructure";
import { CanvasRow } from "../CanvasRow/CanvasRow";
import { RepeatableGroupBand } from "../RepeatableGroupBand/RepeatableGroupBand";
import type { CanvasRowsGridProps } from "./CanvasRowsGrid.types";
import { toCanvasBlocks } from "./CanvasRowsGrid.utils";

export function CanvasRowsGrid({ rows, groups, onFieldContextMenu }: CanvasRowsGridProps) {
  const linkedLabels: Map<string, CanvasField> = useMemo(
    () => buildLinkedLabelIndex(getAllFields(rows)),
    [rows],
  );

  return (
    <ul className="grid list-none grid-cols-16 content-start gap-3">
      {toCanvasBlocks(rows).map((block) => {
        if (block.kind === "row") {
          return (
            <CanvasRow
              key={block.row.id}
              row={block.row}
              linkedLabels={linkedLabels}
              onFieldContextMenu={onFieldContextMenu}
            />
          );
        }

        const group: RepeatableGroup | undefined = (groups ?? []).find(
          (candidate) => candidate.id === block.groupId,
        );

        if (!group) {
          return block.rows.map((row) => (
            <CanvasRow
              key={row.id}
              row={row}
              linkedLabels={linkedLabels}
              onFieldContextMenu={onFieldContextMenu}
            />
          ));
        }

        return (
          <RepeatableGroupBand
            key={group.id}
            group={group}
            rows={block.rows}
            linkedLabels={linkedLabels}
            onFieldContextMenu={onFieldContextMenu}
          />
        );
      })}
    </ul>
  );
}
