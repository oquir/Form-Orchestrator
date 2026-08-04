import type { CanvasField } from "../../types/field";
import type { CanvasRow } from "../../types/formStructure";
import type { FieldPlacement } from "../../types/placement";
import type { FreeRun } from "./rowLayout.types";

// Reglas de colocacion dentro de una fila, como funciones puras: sin React y sin el store, para
// poder razonarlas y probarlas solas. Dos decisiones las gobiernan todas:
// los choques se resuelven deslizando lo que se arrastra hasta el hueco mas cercano, nunca
// empujando al vecino; y los huecos se conservan, porque cada posicion es explicita.
// Una fila es una sola linea visual: si no cabe, se rechaza en vez de pasar a un segundo renglon.

export function sortByColumn(fields: CanvasField[]): CanvasField[] {
  return [...fields].sort((a, b) => a.colStart - b.colStart);
}

// Los tramos libres de la fila. `excludeFieldId` saca de la cuenta al campo que se esta moviendo,
// para que no se estorbe a si mismo y pueda quedarse donde ya estaba.
export function getFreeRuns(
  fields: CanvasField[],
  columns: number,
  excludeFieldId?: string,
): FreeRun[] {
  // Indexado por numero de columna empezando en 1, como las lineas de grid de CSS; sobran dos
  // casillas para no tener que comprobar los bordes en cada vuelta.
  const occupied: boolean[] = new Array(columns + 2).fill(false);
  for (const field of fields) {
    if (field.id === excludeFieldId) continue;
    const end = Math.min(field.colStart + field.colSpan - 1, columns);

    for (let column = Math.max(1, field.colStart); column <= end; column++) {
      occupied[column] = true;
    }
  }

  const runs: FreeRun[] = [];
  let runStart: number | null = null;

  for (let column = 1; column <= columns; column++) {
    if (!occupied[column]) {
      if (runStart === null) runStart = column;
      continue;
    }

    if (runStart !== null) {
      runs.push({ start: runStart, length: column - runStart });
      runStart = null;
    }
  }

  if (runStart !== null) runs.push({ start: runStart, length: columns - runStart + 1 });
  return runs;
}

export function findFirstFit(runs: FreeRun[], colSpan: number): number | null {
  for (const run of runs) {
    if (run.length >= colSpan) return run.start;
  }

  return null;
}

// El iman: dado donde el usuario solto, devuelve la posicion valida mas cercana. Dentro de cada
// tramo se acota el inicio deseado a lo que cabe, y despues gana el candidato menos desplazado.
// Si ningun tramo da el ancho, devuelve null y el drop se rechaza en rojo.
export function findNearestFit(
  runs: FreeRun[],
  desiredStart: number,
  colSpan: number,
): number | null {
  let best: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const run of runs) {
    if (run.length < colSpan) continue;
    const lastValidStart = run.start + run.length - colSpan;
    const candidate = Math.min(Math.max(desiredStart, run.start), lastValidStart);
    const distance = Math.abs(candidate - desiredStart);

    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

export function getLargestRun(runs: FreeRun[]): FreeRun | null {
  let largest: FreeRun | null = null;
  for (const run of runs) {
    if (!largest || run.length > largest.length) largest = run;
  }

  return largest;
}

export function getMaxSpanAt(runs: FreeRun[], colStart: number): number {
  for (const run of runs) {
    if (colStart >= run.start && colStart < run.start + run.length) {
      return run.start + run.length - colStart;
    }
  }

  return 1;
}

// Tres intentos en orden: respetar lo que el usuario pidio deslizandolo al hueco mas cercano,
// si no hay pedido explicito buscar el primer sitio donde quepa entero, y como ultimo recurso
// entrar recortado en el tramo mas ancho. Solo si la fila esta llena devuelve null.
export function resolvePlacement(
  row: CanvasRow,
  colSpan: number,
  requested?: FieldPlacement,
  excludeFieldId?: string,
): FieldPlacement | null {
  const runs: FreeRun[] = getFreeRuns(row.fields, row.columns, excludeFieldId);

  if (requested) {
    const span = Math.max(1, Math.min(requested.colSpan, row.columns));
    const snapped: number | null = findNearestFit(runs, requested.colStart, span);
    if (snapped !== null) return { colStart: snapped, colSpan: span };
  }

  const span: number = Math.max(1, Math.min(colSpan, row.columns));
  const firstFit: number | null = findFirstFit(runs, span);
  if (firstFit !== null) return { colStart: firstFit, colSpan: span };

  const largest: FreeRun | null = getLargestRun(runs);
  if (largest) return { colStart: largest.start, colSpan: largest.length };

  return null;
}

// La unica operacion que rompe la regla de conservar los huecos, y a proposito: cambiar el numero
// de columnas de una fila es un cambio de maqueta deliberado, asi que se reempaqueta todo pegado.
export function repackRow(row: CanvasRow, columns: number): CanvasRow {
  const ordered: CanvasField[] = sortByColumn(row.fields);
  let cursor = 1;

  const fields: CanvasField[] = ordered.map((field, index) => {
    // Se reserva una columna para cada campo que todavia falta por colocar: asi al encoger la
    // fila ninguno se queda fuera, todos se estrechan hasta el minimo de uno.
    const fieldsAfter = ordered.length - index - 1;
    const available = columns - cursor + 1 - fieldsAfter;
    const colSpan = Math.max(1, Math.min(field.colSpan, available));
    const placed: CanvasField = { ...field, colStart: cursor, colSpan };
    cursor += colSpan;
    return placed;
  });

  return { ...row, columns, fields };
}

export function splitOverflowingRow(row: CanvasRow): CanvasRow[] {
  const lines: CanvasField[][] = [];
  let current: CanvasField[] = [];
  let cursor = 1;

  for (const field of row.fields) {
    const colSpan = Math.max(1, Math.min(field.colSpan, row.columns));
    if (cursor + colSpan - 1 > row.columns && current.length > 0) {
      lines.push(current);
      current = [];
      cursor = 1;
    }

    current.push({ ...field, colStart: cursor, colSpan });
    cursor += colSpan;
  }

  if (current.length > 0) lines.push(current);
  if (lines.length === 0) return [{ ...row, fields: [] }];

  return lines.map((fields, index) => ({
    ...row,
    id: index === 0 ? row.id : `${row.id}-l${index}`,
    fields,
  }));
}

// Migracion de borradores viejos, anteriores a que existiera colStart. Antes una fila podia
// desbordar y el navegador la partia en varias lineas; aca cada linea visual pasa a ser una fila
// de verdad. La ausencia de colStart es la senal de que el borrador es de aquella epoca.
export function migrateRows(rows: CanvasRow[]): CanvasRow[] {
  const needsMigration = rows.some((row) =>
    row.fields.some((field) => typeof field.colStart !== "number"),
  );

  if (!needsMigration) return rows;
  return rows.flatMap((row) => splitOverflowingRow(row));
}
