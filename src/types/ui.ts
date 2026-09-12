export type SidebarTab =
  | "fields"
  | "attributes"
  | "validations"
  | "styles"
  | "logic"
  | "apiMapping"
  | "catalogs"
  | "fechas";

export type RightSidebarTab = "project" | "steps";

export type CanvasViewMode = "canvas" | "json" | "payload";

// Que hace el puntero sobre el lienzo. "move" es el de siempre: seleccionar, arrastrar y
// redimensionar. "select" y "hand" dejan el documento inerte y el puntero lo maneja el puerto.
export type CanvasTool = "move" | "select" | "hand";

export interface CanvasToolItem {
  tool: CanvasTool;
  label: string;
  // Tecla sin modificadores. La lee el atajo de teclado y la muestra el title del boton.
  shortcut: string;
}
