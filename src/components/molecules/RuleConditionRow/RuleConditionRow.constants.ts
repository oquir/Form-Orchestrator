export const ROW_CLASSES: string =
  "flex items-start gap-3 rounded-md border border-border-subtle bg-surface p-3";

// Campo, operador y valor en una linea, para que la condicion se lea como frase. El campo lleva mas
// ancho porque su texto es el mas largo (etiqueta y tipo). Por debajo de sm vuelven a apilarse.
export const PARTS_CLASSES: string =
  "grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,4fr)]";

// mt-5 baja la X a la altura de los controles, debajo de sus rotulos.
export const REMOVE_BUTTON_CLASSES: string =
  "mt-5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-fg-subtle transition-colors hover:cursor-pointer hover:bg-danger-surface hover:text-danger";
