import type { CanvasRow, RepeatableGroup } from "../types/formStructure";

// Zustand lee los selectores con useSyncExternalStore, que compara por identidad. Un selector que
// devuelva un [] nuevo en cada llamada se ve siempre como un valor distinto y dispara un bucle de
// renders ("Maximum update depth exceeded"). Estos son los vacios compartidos que lo evitan:
// nunca escribir un [] literal dentro de un selector.
export const NO_ROWS: CanvasRow[] = [];
export const NO_GROUPS: RepeatableGroup[] = [];
// La seleccion vacia, por la misma razon aunque sea estado y no un selector: CanvasRow se suscribe
// al arreglo, y un [] nuevo en cada limpieza redibujaria todas las filas sin que nada cambie.
export const NO_SELECTION: string[] = [];
export const THEME_STORAGE_KEY: string = "form-orchestrator-theme";
