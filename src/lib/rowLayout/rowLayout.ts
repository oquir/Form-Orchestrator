import type { CanvasField, CanvasRow, FieldPlacement } from "../../types/storeTypes";
import type { FreeRun } from "./rowLayout.types";

export function sortByColumn(fields: CanvasField[]): CanvasField[] {
  return [...fields].sort((a, b) => a.colStart - b.colStart);
}

export function getFreeRuns(
  fields: CanvasField[],
  columns: number,
  excludeFieldId?: string,
): FreeRun[] {
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

export function repackRow(row: CanvasRow, columns: number): CanvasRow {
  const ordered: CanvasField[] = sortByColumn(row.fields);
  let cursor = 1;

  const fields: CanvasField[] = ordered.map((field, index) => {
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

export function migrateRows(rows: CanvasRow[]): CanvasRow[] {
  const needsMigration = rows.some((row) =>
    row.fields.some((field) => typeof field.colStart !== "number"),
  );
  if (!needsMigration) return rows;
  return rows.flatMap((row) => splitOverflowingRow(row));
}
