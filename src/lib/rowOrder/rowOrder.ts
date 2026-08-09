import type { CanvasRow } from "../../types/formStructure";
import type { RowDropEdge, RowDropTarget } from "../../types/placement";
import { normalizeGroupRows } from "../repeatableGroup/repeatableGroup";

// Reordenar filas enteras dentro de un lienzo, como funciones puras: sin React y sin el store,
// igual que rowLayout, que hace lo mismo con los campos dentro de una fila.
//
// La regla que gobierna todo lo demas: arrastrar una fila nunca la mete ni la saca de un grupo
// repetible. Sacarla obligaria a limpiar el apiBinding de todos sus campos -la ruta
// actividades[].idActividad no significa nada fuera del arreglo- y hacer eso de callado, en medio
// de un gesto de arrastre, destruye mapeos que nadie pidio tocar. Entrar y salir de un grupo
// sigue siendo una accion aparte y explicita.
//
// De ahi las dos salidas, que son las mismas dos que ya usa rowLayout: una fila suelta sobre una
// banda se pega por iman al borde de la banda, y una fila que vive dentro de un grupo se marca
// invalida en cuanto apunta fuera de el, para que el arrastre se rechace en vez de mentir.

export function resolveRowDrop(
  rows: CanvasRow[],
  draggedRowId: string,
  hoveredRowId: string,
  edge: RowDropEdge,
): RowDropTarget | null {
  const dragged: CanvasRow | undefined = rows.find((row) => row.id === draggedRowId);
  const hovered: CanvasRow | undefined = rows.find((row) => row.id === hoveredRowId);
  if (!dragged || !hovered) return null;

  // Misma pertenencia, sea la de las filas sueltas o la de un mismo grupo: se reordena libremente.
  if (dragged.groupId === hovered.groupId) {
    return { rowId: hovered.id, edge, isValid: true };
  }

  if (dragged.groupId !== undefined) {
    return { rowId: hovered.id, edge, isValid: false };
  }

  // Se decide por que mitad de la banda cae el puntero y no por la fila concreta que hay debajo,
  // porque el destino real no es esa fila sino uno de los dos bordes del grupo entero.
  const members: CanvasRow[] = rows.filter((row) => row.groupId === hovered.groupId);
  const insertAt: number = members.indexOf(hovered) + (edge === "after" ? 1 : 0);

  return insertAt * 2 <= members.length
    ? { rowId: members[0].id, edge: "before", isValid: true }
    : { rowId: members[members.length - 1].id, edge: "after", isValid: true };
}

// La cabecera de una banda -titulo, minimo, maximo y el select de arrayPath- mide bastante mas que
// el hueco entre filas. Sin un objetivo propio seria zona muerta: el indicador desapareceria justo
// encima del grupo, que es donde mas natural resulta querer soltar la fila.
export function resolveBandDrop(
  rows: CanvasRow[],
  draggedRowId: string,
  groupId: string,
  edge: RowDropEdge,
): RowDropTarget | null {
  const dragged: CanvasRow | undefined = rows.find((row) => row.id === draggedRowId);
  const members: CanvasRow[] = rows.filter((row) => row.groupId === groupId);
  if (!dragged || members.length === 0) return null;

  // Soltar una fila sobre la cabecera de su propio grupo no dice a que altura va: no es un error,
  // simplemente no hay nada que senalar.
  if (dragged.groupId === groupId) return null;

  if (dragged.groupId !== undefined) {
    return { rowId: members[0].id, edge: "before", isValid: false };
  }

  return edge === "before"
    ? { rowId: members[0].id, edge: "before", isValid: true }
    : { rowId: members[members.length - 1].id, edge: "after", isValid: true };
}

export function reorderRows(
  rows: CanvasRow[],
  draggedRowId: string,
  target: RowDropTarget,
): CanvasRow[] {
  if (!target.isValid) return rows;

  const from: number = rows.findIndex((row) => row.id === draggedRowId);
  const anchor: number = rows.findIndex((row) => row.id === target.rowId);
  // anchor en -1 tambien cubre el arrastre entre lienzos: la fila destino vive en otro paso y esta
  // lista no la contiene, asi que el movimiento se rechaza solo.
  if (from === -1 || anchor === -1) return rows;

  const to: number = target.edge === "before" ? anchor : anchor + 1;
  // Los dos bordes que rodean a la propia fila la dejan exactamente donde ya estaba.
  if (to === from || to === from + 1) return rows;

  const next: CanvasRow[] = [...rows];
  const [moved] = next.splice(from, 1);
  // Sacar la fila corrio un puesto hacia atras todo lo que venia detras de ella.
  next.splice(to > from ? to - 1 : to, 0, moved);

  // Con la regla de arriba las filas de un grupo ya llegan contiguas, pero un borrador editado a
  // mano puede traerlas salteadas y el splice las dejaria todavia mas partidas.
  return normalizeGroupRows(next);
}
