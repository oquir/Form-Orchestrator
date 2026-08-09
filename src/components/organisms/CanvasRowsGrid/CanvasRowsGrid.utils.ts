import { GRID_GAP_PX } from "../../../constants/grid";
import type { CanvasRow } from "../../../types/formStructure";
import type { RowDragState, RowDropTarget } from "../../../types/placement";
import type { CanvasBlock, RowDisplacement } from "./CanvasRowsGrid.types";

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

// Referencia estable: la grilla la pasa a cada fila y devolver mapas nuevos cuando no se arrastra
// nada haria que todas se volvieran a dibujar por gusto.
const NO_DISPLACEMENT: RowDisplacement = { rows: new Map(), bands: new Map() };

// Que se aparta y cuanto para que se abra el hueco donde va a caer la fila. Es la mitad visual de
// lo que rowOrder resuelve como dato: mismos dos casos y misma frontera de grupo.
export function buildRowDisplacement(
  blocks: CanvasBlock[],
  rows: CanvasRow[],
  rowDrag: RowDragState | null,
  target: RowDropTarget | null,
): RowDisplacement {
  if (!rowDrag || !target?.isValid) return NO_DISPLACEMENT;

  const dragged: CanvasRow | undefined = rows.find((row) => row.id === rowDrag.rowId);
  if (!dragged) return NO_DISPLACEMENT;

  const shift: number = rowDrag.height + GRID_GAP_PX;

  // Dentro de un grupo el hueco se abre entre las filas de la banda, que son hermanas. Fuera, entre
  // bloques: una fila suelta nunca entra en una banda, asi que la banda se aparta entera.
  if (dragged.groupId !== undefined) {
    const members: string[] = rows
      .filter((row) => row.groupId === dragged.groupId)
      .map((row) => row.id);

    return {
      rows: displace(
        members,
        members.indexOf(dragged.id),
        members.indexOf(target.rowId),
        target,
        shift,
      ),
      bands: NO_DISPLACEMENT.bands,
    };
  }

  const keys: string[] = blocks.map((block) =>
    block.kind === "row" ? block.row.id : block.groupId,
  );
  const from: number = blocks.findIndex(
    (block) => block.kind === "row" && block.row.id === dragged.id,
  );
  const anchor: number = blocks.findIndex((block) =>
    block.kind === "row"
      ? block.row.id === target.rowId
      : block.rows.some((row) => row.id === target.rowId),
  );

  const offsets: Map<string, number> = displace(keys, from, anchor, target, shift);
  const rowOffsets = new Map<string, number>();
  const bandOffsets = new Map<string, number>();

  blocks.forEach((block, index) => {
    const offset: number | undefined = offsets.get(keys[index]);
    if (offset === undefined) return;

    if (block.kind === "row") rowOffsets.set(block.row.id, offset);
    else bandOffsets.set(block.groupId, offset);
  });

  return { rows: rowOffsets, bands: bandOffsets };
}

// Solo se mueve lo que queda entre el origen y el destino, y siempre un sitio entero: los de arriba
// bajan o los de abajo suben, nunca las dos cosas.
function displace(
  keys: string[],
  from: number,
  anchor: number,
  target: RowDropTarget,
  shift: number,
): Map<string, number> {
  const offsets = new Map<string, number>();
  if (from === -1 || anchor === -1) return offsets;

  const to: number = target.edge === "before" ? anchor : anchor + 1;

  for (let index = 0; index < keys.length; index++) {
    if (to > from && index > from && index < to) offsets.set(keys[index], -shift);
    if (to < from && index >= to && index < from) offsets.set(keys[index], shift);
  }

  return offsets;
}
