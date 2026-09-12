// Un punto en el espacio de scroll del puerto: no se mueve cuando el puerto se desplaza.
export interface ScrollPoint {
  x: number;
  y: number;
}

export interface MarqueeGesture {
  pointerId: number;
  // El nodo que tiene la captura, para poder soltarla aunque el gesto termine por otra via.
  target: Element;
  origin: ScrollPoint;
  clientX: number;
  clientY: number;
  // La seleccion de cuando empezo el gesto: el marco suma sobre ella y Escape la restaura.
  base: string[];
  // Pasa a true al superar el umbral; hasta entonces el gesto todavia puede terminar en un clic.
  active: boolean;
}
