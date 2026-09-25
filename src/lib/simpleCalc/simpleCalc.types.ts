import type { CalcSign } from "../../types/simpleCalc";

// Lo que el lector saca del texto, todavia por nombre: pasarlo a ids es cosa de quien tiene las
// opciones.
export interface CalcShape {
  terms: { sign: CalcSign; name: string }[];
  floorAtZero: boolean;
  multiplier: number | null;
}
