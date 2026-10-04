// El icono del calendario y el desplegable los pinta el navegador: sin color-scheme oscuro quedan
// negro sobre negro.
export const NATIVE_CLASSES: string = "dark:[color-scheme:dark]";

// El input nativo queda invisible debajo del boton y no debajo del texto: el navegador abre el
// calendario pegado al elemento que lo pide, y asi aparece al lado del icono que se toco.
export const PICKER_CLASSES: string =
  "pointer-events-none absolute top-0 right-0 h-full w-9 opacity-0 dark:[color-scheme:dark]";

export const CALENDAR_BUTTON_CLASSES: string =
  "absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-fg-muted transition-colors hover:cursor-pointer hover:bg-surface-raised hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-40";
