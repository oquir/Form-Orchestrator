// Ancho maximo del documento en el lienzo: lo que antes daban max-w-5xl (64rem) menos el px-6 de
// cada lado. Hacer libre el lienzo no cambia cuanto mide el formulario.
export const DOCUMENT_MAX_WIDTH_PX: number = 976;

// Aire minimo a cada lado del documento cuando el zoom lo hace mas ancho que la vista.
export const DOCUMENT_GUTTER_PX: number = 24;

// Aire entre el borde de la vista y el del documento al volver al inicio, arriba y abajo.
export const DOCUMENT_VERTICAL_GUTTER_PX: number = 32;

// Margen de paneo alrededor del documento, como fraccion del puerto en cada eje. Con medio puerto
// por lado el borde del documento llega hasta el centro de la vista, y el margen siempre cubre lo
// que el zoom desborda por la izquierda: (W*k - W)/2 <= (puerto - 48)/4 con k <= 1.5.
export const CANVAS_PAN_ROOM_RATIO: number = 0.5;
