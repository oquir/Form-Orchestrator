import type { CanvasTool } from "../../../types/ui";

// El cursor anuncia la herramienta. select-none porque con la mano o el marco arrastrar sobre el
// lienzo no debe seleccionar texto. active:cursor-grabbing cierra la mano sin estado: la raiz queda
// :active desde que se pulsa hasta que se suelta.
export const TOOL_ROOT_CLASSES: Record<CanvasTool, string> = {
  move: "",
  select: "cursor-crosshair select-none",
  hand: "cursor-grab select-none active:cursor-grabbing",
};
