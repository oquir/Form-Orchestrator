export type CanvasTarget =
  | { type: "formStep"; stepId: string }
  | { type: "introStep"; stepId: string };

export type PlacementMode = "move" | "resize";

export interface FieldPlacement {
  colStart: number;
  colSpan: number;
}

export interface DragPlacement extends FieldPlacement {
  rowId: string;
  mode: PlacementMode;
  isValid: boolean;
}

export type RowDropEdge = "before" | "after";

// Medidas de la fila que se arrastra, tomadas una vez al empezar. El overlay dibuja la seccion
// entera a su mismo ancho, y las filas que le dejan paso se apartan exactamente su alto.
export interface RowDragState {
  rowId: string;
  width: number;
  height: number;
}

// Donde caeria la fila que se arrastra, ya resuelta: `rowId` mas `edge` es el borde definitivo,
// no el que el puntero senala. Asi el indicador se dibuja donde la fila va a quedar de verdad.
export interface RowDropTarget {
  rowId: string;
  edge: RowDropEdge;
  isValid: boolean;
}
