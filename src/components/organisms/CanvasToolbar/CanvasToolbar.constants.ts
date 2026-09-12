import type { IconComponent } from "reicon-react";
import { Cursor, Hand, VectorSquare } from "reicon-react";
import type { CanvasTool } from "../../../types/ui";

// El icono es cosa de la barra y no de la herramienta: CANVAS_TOOLS sigue siendo la lista canonica
// de herramientas, etiquetas y atajos, igual que VIEW_MODE_TABS con los iconos de ViewModeSwitch.
export const TOOL_ICONS: Record<CanvasTool, IconComponent> = {
  move: Cursor,
  select: VectorSquare,
  hand: Hand,
};

// Flota sobre el lienzo sin desplazarse ni escalarse: vive fuera de main, en el slot canvasOverlay
// de AppLayout. Centrada abajo, como la barra de herramientas de Figma.
export const TOOLBAR_CLASSES: string =
  "absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-lg dark:bg-surface-raised";

export const TOOLBAR_GROUP_CLASSES: string = "flex items-center gap-0.5";

export const TOOLBAR_DIVIDER_CLASSES: string = "mx-0.5 h-5 w-px bg-border";

export const TOOL_BUTTON_BASE_CLASSES: string =
  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:cursor-pointer";

// La herramienta activa si va en naranja, a diferencia de la vista del panel derecho: la herramienta
// cambia lo que hace un clic sobre el lienzo, y seguir en el modo equivocado sin notarlo es
// seleccionar o desplazar cuando se queria mover. Tiene que verse de reojo.
export const TOOL_BUTTON_ACTIVE_CLASSES: string = "bg-brand text-on-brand";

export const TOOL_BUTTON_INACTIVE_CLASSES: string =
  "text-fg-muted hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset";

export const TOOLBAR_ICON_ACTION_CLASSES: string =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:cursor-pointer hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset";

export const TOOLBAR_DANGER_CLASSES: string =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:cursor-pointer hover:bg-danger-surface hover:text-danger";

export const SELECTION_COUNT_CLASSES: string =
  "px-2 text-xs font-semibold tabular-nums text-fg-strong";
