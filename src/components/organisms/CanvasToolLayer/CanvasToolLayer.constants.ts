// fixed y fuera de la escala, como FieldContextMenu: el borde mide un pixel a cualquier zoom. Por
// debajo de la barra flotante (z-30), que no debe quedar tapada si el marco pasa por encima.
export const MARQUEE_CLASSES: string =
  "pointer-events-none fixed z-20 rounded-[3px] border border-brand bg-brand/10";
