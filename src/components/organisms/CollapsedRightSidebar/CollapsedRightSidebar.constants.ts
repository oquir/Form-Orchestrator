// Flota arriba a la derecha, donde estaba el panel. Vive en canvasOverlay, al lado de main: con el
// panel derecho sin renderizar ese envoltorio llega hasta el borde de la ventana, asi que right-4
// cae en la esquina de la pantalla y no dentro del lienzo.
//
// TRAMPA: ni transform, ni filter, ni backdrop-filter, ni will-change en este contenedor. El modal
// de la revision de exportacion es position:fixed con inset-0 y se dibuja desde adentro; cualquiera
// de esas propiedades crea bloque contenedor y el modal pasaria a medirse contra el chip en vez de
// contra la ventana. Por eso no se copia el -translate-x-1/2 de TOOLBAR_CLASSES, que ademas aca no
// hace falta. Tampoco overflow-hidden: recortaria el menu del zoom.
export const CHIP_CLASSES: string =
  "animate-collapsed-panel-in absolute right-4 top-4 z-30 flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-lg dark:bg-surface-raised";

// El aviso cuelga del chip y no del borde de la ventana: es lo que el panel mostraba, y pegado
// abajo se lee como suyo. w-80 le devuelve el ancho que tenia dentro del panel, y la sombra lo
// despega del lienzo, que ahora tiene debajo en vez de una superficie.
export const NOTICE_CLASSES: string = "absolute right-4 top-16 z-30 w-80 shadow-lg";
