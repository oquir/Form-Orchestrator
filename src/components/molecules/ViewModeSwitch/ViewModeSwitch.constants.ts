import type { IconComponent } from "reicon-react";
import { Code12, Grid, Hierarchy22 } from "reicon-react";
import type { CanvasViewMode } from "../../../types/ui";

// El icono es cosa del control, no del modo: VIEW_MODE_TABS sigue siendo la lista canonica de
// modos y etiquetas, y aca solo se le pone cara a cada uno.
export const VIEW_MODE_ICONS: Record<CanvasViewMode, IconComponent> = {
  canvas: Grid,
  json: Code12,
  payload: Hierarchy22,
};

// Riel hundido con la opcion activa en pastilla elevada. El activo no va en naranja aunque sea la
// eleccion vigente: el naranja del panel esta reservado para Exportar, que es la unica accion
// primaria, y dos naranjas a un centimetro de distancia se disputan la mirada.
export const SWITCH_TRACK_CLASSES: string =
  "flex gap-0.5 rounded-lg border border-border bg-surface-sunken p-[3px]";

export const SWITCH_ITEM_BASE_CLASSES: string =
  "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[11px] transition-colors hover:cursor-pointer";

export const SWITCH_ITEM_ACTIVE_CLASSES: string =
  "bg-surface font-semibold text-fg-strong shadow-sm dark:bg-surface-inset";

export const SWITCH_ITEM_INACTIVE_CLASSES: string =
  "font-medium text-fg-muted hover:text-fg-strong";
