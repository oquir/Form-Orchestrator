// Una referencia {campo} encontrada en la fuente. `start` cae sobre la llave de apertura y `end`
// justo despues de la de cierre, para que el editor pueda decorar el tramo completo.
export interface ScriptRef {
  name: string;
  start: number;
  end: number;
  known: boolean;
}

export interface ScriptCompileResult {
  // Cuerpo de funcion listo para new Function, con las referencias conocidas ya sustituidas.
  code: string;
  refs: ScriptRef[];
  reads: string[];
  unknown: string[];
}

export interface ScriptValidation extends ScriptCompileResult {
  error: string | null;
  isEmpty: boolean;
  isValid: boolean;
}

export interface PreludeValidation {
  // Las referencias a campos son ilegales en el preludio: viajan aca para poder nombrarlas.
  refs: ScriptRef[];
  error: string | null;
  isEmpty: boolean;
  isValid: boolean;
}

export type ScriptFunction = (...args: unknown[]) => unknown;

export interface ScriptFunctionResult {
  fn: ScriptFunction | null;
  error: string | null;
}
