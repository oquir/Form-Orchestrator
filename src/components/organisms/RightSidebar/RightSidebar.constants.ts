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

export const SIMULATOR_BUTTON_CLASSES: string =
  "flex items-center gap-1.5 rounded-md border border-brand-border px-2.5 py-1 text-xs font-medium text-brand-fg transition-colors hover:bg-brand-surface hover:cursor-pointer";

export const EXPORT_BUTTON_CLASSES: string =
  "rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-on-brand transition-colors hover:bg-brand-hover hover:cursor-pointer";
