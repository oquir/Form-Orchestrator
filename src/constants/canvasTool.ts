import type { CanvasToolItem } from "../types/ui";

// La lista canonica de herramientas del lienzo. El atajo sale de aca tanto para el teclado como
// para el title de cada boton, asi los dos no pueden anunciar teclas distintas.
export const CANVAS_TOOLS: CanvasToolItem[] = [
  { tool: "move", label: "Mover", shortcut: "V" },
  { tool: "select", label: "Selección múltiple", shortcut: "M" },
  { tool: "hand", label: "Mano", shortcut: "H" },
];
