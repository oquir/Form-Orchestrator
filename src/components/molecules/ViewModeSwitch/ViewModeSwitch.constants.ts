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
