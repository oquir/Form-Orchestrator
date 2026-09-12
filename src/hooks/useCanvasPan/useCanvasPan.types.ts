export interface PanGesture {
  pointerId: number;
  // El nodo que tiene la captura, para poder soltarla aunque el gesto termine por otra via.
  target: Element;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
}
