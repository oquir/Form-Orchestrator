// Clases de Tailwind que se repetian igual, letra por letra, en varios paneles y tarjetas del
// sidebar. Viven aca para que cambiar un token de diseno (index.css) no dependa de encontrar cada
// copia; donde el texto crudo no coincidia con el token (colores de dark mode escritos a mano) se
// tomo el token como version correcta y se ajusto el archivo que se desviaba.

export const HINT_CLASSES: string = "text-[11px] text-fg-subtle";

export const ERROR_CLASSES: string = "text-[11px] text-danger";

export const WARNING_CLASSES: string = "text-[11px] text-warning";

// El aviso en caja, con borde y fondo, a diferencia de WARNING_CLASSES que es solo texto.
export const WARNING_BANNER_CLASSES: string =
  "rounded border border-warning-border bg-warning-surface px-2 py-1 text-[11px] text-warning";

// La insignia dice de un vistazo cuales estan cargados, que es lo que uno viene a mirar a estas
// pestanas. Cargado en verde y vacio en gris: el color hace el barrido, no el texto.
export const BADGE_LOADED_CLASSES: string =
  "rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300";

export const BADGE_EMPTY_CLASSES: string =
  "rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-fg-subtle";

export const INPUT_CLASSES: string =
  "w-full rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const TEXTAREA_CLASSES: string = `${INPUT_CLASSES} h-24 resize-y font-mono`;

export const SELECT_CLASSES: string =
  "min-w-0 flex-1 rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const ACTION_CLASSES: string =
  "shrink-0 text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover";

export const COUNT_CLASSES: string =
  "rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-fg-muted";

export const ADD_LINK_CLASSES: string =
  "text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover disabled:cursor-not-allowed disabled:opacity-40";

// El cromo del lienzo (tiradores, barra de fila, botones de borrar) aparece al pasar por encima y
// se queda fijo en lo que esta seleccionado o enfocado: el hover solo no existe ni para el teclado
// ni para una pantalla tactil. Son dos cadenas literales y no una funcion con el nombre del grupo
// como argumento porque Tailwind v4 lee el codigo fuente: una clase armada en tiempo de ejecucion
// no llega nunca al CSS. Cada elemento pone su propia transicion, asi que aca no va ninguna.
export const CHROME_ON_FIELD_CLASSES: string =
  "opacity-0 group-hover/field:opacity-100 group-focus-within/field:opacity-100";

export const CHROME_ON_ROW_CLASSES: string =
  "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100";

export const CHROME_PINNED_CLASSES: string = "opacity-100";

// La barra de herramientas de una fila del lienzo. El disparador y el desplegable los dibujan
// RowColumnsMenu y RowStylesMenu, que viven en otra carpeta, asi que las clases no pueden quedarse
// privadas dentro de RowToolbar.
export const ROW_TOOLBAR_ITEM_CLASSES: string =
  "flex h-5 items-center justify-center rounded-md px-1.5 text-[10px] font-medium text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset";

export const ROW_TOOLBAR_ICON_ITEM_CLASSES: string =
  "flex h-5 w-5 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset";

// El desplegable cuelga de la barra, que esta pegada al borde derecho de la fila: abriendose hacia
// la derecha se saldria del lienzo.
export const ROW_TOOLBAR_POPOVER_CLASSES: string =
  "absolute right-0 top-6 z-20 flex w-72 flex-col gap-2 rounded-md border border-border bg-surface p-3 shadow-lg dark:bg-surface-raised";

// Las acciones con texto de la barra flotante del lienzo. Las comparten CanvasToolbar y
// MoveToStepMenu, que viven en carpetas distintas.
export const CANVAS_TOOLBAR_ACTION_CLASSES: string =
  "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-fg-soft transition-colors hover:cursor-pointer hover:bg-surface-raised hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-soft dark:hover:bg-surface-inset";
