import type { RightSidebarTabItem } from "./RightSidebar.types";

export const TABS: RightSidebarTabItem[] = [
  { id: "project", label: "Proyecto" },
  { id: "steps", label: "Steps" },
];

// Subrayado y no pastilla: la pastilla apoyaba una superficie elevada sobre otra y la pestana activa
// terminaba pareciendo un cuarto boton de la fila de acciones. El subrayado se monta sobre el borde
// inferior que la tira ya tiene, y gasta el naranja en una franja de 2px que no le disputa nada al
// boton Exportar.
export const PANEL_TAB_BASE_CLASSES: string =
  "relative flex items-center gap-1.5 px-2 py-2.5 text-xs transition-colors hover:cursor-pointer";

export const PANEL_TAB_ACTIVE_CLASSES: string =
  "font-semibold text-fg-strong after:absolute after:inset-x-1.5 after:-bottom-px after:h-0.5 after:rounded-t-sm after:bg-brand after:content-['']";

export const PANEL_TAB_INACTIVE_CLASSES: string = "font-medium text-fg-subtle hover:text-fg";

// Durante un arrastre la pestana de Steps se impone sola; el punto es lo unico que lo explica.
export const PANEL_TAB_DROP_DOT_CLASSES: string =
  "h-[5px] w-[5px] rounded-full bg-brand ring-[3px] ring-brand/20";

// Icono solo y sin relleno: es un cuarto control al lado de Exportar, que es el unico primario de
// la fila, y con fondo le competiria. Mide como sus vecinos (py-1 text-xs) y no como su gemelo del
// chip flotante, que vive entre botones de 32px.
export const PANEL_COLLAPSE_BUTTON_CLASSES: string =
  "flex h-[26px] w-[26px] items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset";

// La accion del bloque Formulario va como texto y no como boton con fondo: es secundaria, y el
// primario del panel ya lo tiene la fila de acciones (Exportar).
export const OPEN_PROJECT_BUTTON_CLASSES: string =
  "text-[10px] font-medium text-fg-subtle transition-colors hover:text-fg-strong hover:cursor-pointer";
