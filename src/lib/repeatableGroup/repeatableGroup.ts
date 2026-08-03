import { v4 as uuidv4 } from "uuid";
import type { CanvasField } from "../../types/field";
import type { CanvasRow, FormStep, RepeatableGroup } from "../../types/formStructure";
import { slugifyFieldName, uniqueFieldName } from "../fieldName/fieldName";
import {
  DEFAULT_GROUP_MAX,
  DEFAULT_GROUP_MIN,
  MAX_GROUP_ITEMS,
  MIN_GROUP_ITEMS,
} from "./repeatableGroup.constants";

// Un grupo repetible es una marca en la fila (`CanvasRow.groupId`), no un contenedor anidado.
// Se eligio asi porque el drag and drop resuelve todo por rowId y nunca mira dentro de la fila:
// de ese modo mover, redimensionar y colocar campos siguen funcionando dentro de un grupo sin
// una sola linea extra. El precio es que la contiguidad no es estructural y hay que rehacerla a
// mano con normalizeGroupRows despues de cualquier cambio que pueda desordenar las filas.

export function createRepeatableGroup(title: string, taken: Set<string>): RepeatableGroup {
  return {
    id: uuidv4(),
    name: uniqueFieldName(slugifyFieldName(title), taken),
    title,
    min: DEFAULT_GROUP_MIN,
    max: DEFAULT_GROUP_MAX,
  };
}

export function clampGroupBounds(min: number, max: number): { min: number; max: number } {
  const safeMin: number = Math.max(MIN_GROUP_ITEMS, Math.min(MAX_GROUP_ITEMS, Math.round(min)));
  const safeMax: number = Math.max(safeMin, Math.min(MAX_GROUP_ITEMS, Math.round(max)));

  return { min: safeMin, max: safeMax };
}

export function groupRows(rows: CanvasRow[], groupId: string): CanvasRow[] {
  return rows.filter((row) => row.groupId === groupId);
}

export function groupFields(rows: CanvasRow[], groupId: string): CanvasField[] {
  return groupRows(rows, groupId).flatMap((row) => row.fields);
}

export function findGroupIdForRow(rows: CanvasRow[], rowId: string): string | undefined {
  return rows.find((row) => row.id === rowId)?.groupId;
}

export function findGroupIdForField(rows: CanvasRow[], fieldId: string): string | undefined {
  return rows.find((row) => row.fields.some((field) => field.id === fieldId))?.groupId;
}

export function findGroupById(
  step: FormStep,
  groupId: string | undefined,
): RepeatableGroup | undefined {
  if (groupId === undefined) return undefined;

  return (step.groups ?? []).find((group) => group.id === groupId);
}

// Junta las filas de cada grupo en la posicion de la primera de ellas. Sin esto, agregar una fila
// o mover una de sitio deja las filas del grupo salteadas y la banda se dibujaria partida en dos.
export function normalizeGroupRows(rows: CanvasRow[]): CanvasRow[] {
  const emitted = new Set<string>();
  const result: CanvasRow[] = [];

  for (const row of rows) {
    if (row.groupId === undefined) {
      result.push(row);
      continue;
    }

    if (emitted.has(row.groupId)) continue;
    emitted.add(row.groupId);

    for (const member of rows) {
      if (member.groupId === row.groupId) result.push(member);
    }
  }

  return result;
}

// Borrar la ultima fila de un grupo borra el grupo. Es lo contrario de removeGroup, que conserva
// las filas y solo les quita la marca: un grupo sin filas no tiene nada que repetir.
export function pruneEmptyGroups(step: FormStep): FormStep {
  const groups: RepeatableGroup[] | undefined = step.groups;

  if (!groups || groups.length === 0) return step;

  const alive: RepeatableGroup[] = groups.filter((group) =>
    step.rows.some((row) => row.groupId === group.id),
  );

  if (alive.length === groups.length) return step;

  return { ...step, groups: alive.length > 0 ? alive : undefined };
}

export function detachGroup(step: FormStep, groupId: string): FormStep {
  if (!(step.groups ?? []).some((group) => group.id === groupId)) return step;

  const remaining: RepeatableGroup[] = (step.groups ?? []).filter((group) => group.id !== groupId);

  return {
    ...step,
    rows: step.rows.map((row) => (row.groupId === groupId ? { ...row, groupId: undefined } : row)),
    groups: remaining.length > 0 ? remaining : undefined,
  };
}

export function groupNamesInUse(steps: FormStep[]): Set<string> {
  const names = new Set<string>();

  for (const step of steps) {
    for (const group of step.groups ?? []) names.add(group.name);
  }

  return names;
}
