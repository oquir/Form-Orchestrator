import type { SelectionRect } from "../../types/canvasSelection";

// Aritmetica de la seleccion multiple del lienzo: el rectangulo del marco y los conjuntos de ids.
// Pura salvo confirmFieldRemoval, la unica pregunta al usuario, que vive aca para que el atajo de
// teclado y la barra del lienzo no puedan preguntar dos cosas distintas.

export function normalizeRect(x1: number, y1: number, x2: number, y2: number): SelectionRect {
  return {
    left: Math.min(x1, x2),
    top: Math.min(y1, y2),
    right: Math.max(x1, x2),
    bottom: Math.max(y1, y2),
  };
}

// Tocar alcanza, como en Figma: exigir que el campo quede entero adentro obligaria a cruzar de borde
// a borde una fila de ancho completo para agarrar uno solo de sus campos.
export function rectsIntersect(a: SelectionRect, b: SelectionRect): boolean {
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
}

export function pointInRect(x: number, y: number, rect: SelectionRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Por contenido y no por orden: el marco recalcula la seleccion en cada movimiento del puntero y
// arma un arreglo nuevo aunque traiga los mismos ids, que no tiene por que llegar al store.
export function sameIdSet(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  const ids = new Set<string>(a);

  return b.every((id) => ids.has(id));
}

export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id];
}

// Lo que ya estaba primero y lo nuevo despues, sin repetir.
export function mergeIds(base: string[], extra: string[]): string[] {
  const seen = new Set<string>(base);
  const merged: string[] = [...base];

  for (const id of extra) {
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(id);
  }

  return merged;
}

// La misma referencia cuando no hay nada que quitar: el store compara por identidad, y un arreglo
// nuevo en cada borrado haria redibujar todas las filas aunque la seleccion siga igual.
export function withoutIds(ids: string[], removed: ReadonlySet<string>): string[] {
  return ids.some((id) => removed.has(id)) ? ids.filter((id) => !removed.has(id)) : ids;
}

// Sin deshacer, borrar varios campos de un golpe es la unica perdida sin vuelta atras: un Supr con
// el paso entero seleccionado se lleva el trabajo y el autoguardado lo confirma. De a uno no
// pregunta, igual que la X del chip o la de la fila.
export function confirmFieldRemoval(count: number): boolean {
  if (count < 2) return true;

  return window.confirm(`¿Eliminar ${count} campos? No se puede deshacer.`);
}
