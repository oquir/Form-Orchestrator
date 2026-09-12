// Consultas al DOM del lienzo que comparten hooks y organismos de carpetas distintas. Los atributos
// data-* son el contrato: el lienzo los pone y esto los busca. Sin React y sin el store.

export function getCanvasScrollPort(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-canvas-scroll]");
}

export function getRowElement(rowId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-row-id="${rowId}"]`);
}

export function getBandElement(groupId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-band-id="${groupId}"]`);
}

// Los chips de campo del lienzo. Solo hay un paso montado a la vez, asi que no hace falta acotar la
// busqueda al paso activo.
export function getFieldElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-field-id]"));
}
