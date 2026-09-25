// El calculo sin codigo: campos con signo, un multiplicador y un piso en cero. No se guarda en
// ningun lado; vive mientras el modal esta abierto y al aplicar se traduce a logic.script.

export type CalcSign = "+" | "-";

export interface SimpleCalcTerm {
  sign: CalcSign;
  fieldId: string;
}

export interface SimpleCalc {
  terms: SimpleCalcTerm[];
  floorAtZero: boolean;
  multiplier: number | null;
}

// Un campo que se puede elegir como termino. aggregated dice que, visto desde el campo que se
// edita, ese nombre es la columna entera de un grupo y entra envuelto en sum().
export interface CalcTermOption {
  fieldId: string;
  name: string;
  label: string;
  aggregated: boolean;
  createsCycle: boolean;
}

export interface CalcTermOptionGroup {
  id: string;
  label: string;
  options: CalcTermOption[];
}

export interface CalcTermIndex {
  byId: Map<string, CalcTermOption>;
  byName: Map<string, CalcTermOption>;
}

// Una fila del modal: el id es solo la key de React y el campo falta mientras no se elige.
export interface CalcTermDraft {
  id: string;
  sign: CalcSign;
  fieldId: string | null;
}
