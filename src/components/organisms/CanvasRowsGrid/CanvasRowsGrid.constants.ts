import type { RowDisplacement } from "./CanvasRowsGrid.types";

// Referencia estable: la grilla la pasa a cada fila y devolver mapas nuevos cuando no se arrastra
// nada haria que todas se volvieran a dibujar por gusto.
export const NO_DISPLACEMENT: RowDisplacement = { rows: new Map(), bands: new Map() };
