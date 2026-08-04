import type { CanvasRow, RepeatableGroup } from "../types/formStructure";

// Zustand lee los selectores con useSyncExternalStore, que compara por identidad. Un selector que
// devuelva un [] nuevo en cada llamada se ve siempre como un valor distinto y dispara un bucle de
// renders ("Maximum update depth exceeded"). Estos son los vacios compartidos que lo evitan:
// nunca escribir un [] literal dentro de un selector.
export const NO_ROWS: CanvasRow[] = [];
export const NO_GROUPS: RepeatableGroup[] = [];
export const THEME_STORAGE_KEY: string = "form-orchestrator-theme";
