import { getCanvasScrollPort } from "../../lib/canvasDom/canvasDom";

// Un atajo de una sola tecla no puede dispararse mientras se escribe. Sin esta guarda, teclear la
// etiqueta de un campo y pulsar Suprimir borra el campo entero en vez de un caracter.
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tag: string = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

// :hover lo resuelve el navegador con la ultima posicion conocida del puntero, sin listeners propios.
export function isPointerOverCanvas(): boolean {
  return getCanvasScrollPort()?.matches(":hover") ?? false;
}
