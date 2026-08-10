// Lo que el runtime inyecta en el ambito de cada script. Los helpers se pasan como parametros con
// nombre y no dentro de un objeto contenedor para que se llamen sueltos -- sum(x) y no lib.sum(x) --
// y para que el editor pueda ofrecerlos como identificadores reales.
//
// Reemplaza a FORMULA_FUNCTIONS de constants/formula.ts, que sigue en pie mientras exista el
// lenguaje viejo. roundTo y el digito de verificacion estan duplicados a proposito durante la
// migracion: acoplar el modulo nuevo al que se va a borrar seria peor que repetir dos funciones.

// Todo lo que no sea un numero legible vale 0: un campo vacio, un texto o un valor ausente.
// Es la semantica del lenguaje y el consumidor tiene que copiarla.
export function toScriptNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean") return value ? 1 : 0;

  if (typeof value === "string") {
    const trimmed: string = value.trim();
    if (trimmed.length === 0) return 0;
    const parsed: number = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

// Aplana un nivel de arrays: la columna de un grupo repetible llega como array, asi que
// sum({impuesto_actividad}) y sum(a, b) tienen que ser la misma llamada.
function toNumbers(args: unknown[]): number[] {
  const flat: number[] = [];

  for (const arg of args) {
    if (Array.isArray(arg)) {
      for (const item of arg) flat.push(toScriptNumber(item));
      continue;
    }

    flat.push(toScriptNumber(arg));
  }

  return flat;
}

function roundTo(value: number, decimals: number): number {
  const factor: number = 10 ** Math.trunc(decimals);
  return Math.round(value * factor) / factor;
}

// Pesos oficiales DIAN, de derecha a izquierda sobre las cifras del NIT.
const DV_WEIGHTS: number[] = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

function digitoVerificacion(nit: number): number {
  if (!Number.isFinite(nit)) return 0;

  const digits: string = String(Math.trunc(Math.abs(nit)));
  let total = 0;

  for (let i = 0; i < digits.length && i < DV_WEIGHTS.length; i += 1) {
    total += Number(digits[digits.length - 1 - i]) * DV_WEIGHTS[i];
  }

  const remainder: number = total % 11;

  return remainder < 2 ? remainder : 11 - remainder;
}

export const SCRIPT_HELPERS: Record<string, (...args: unknown[]) => number> = {
  num: (...args) => toScriptNumber(args[0]),
  sum: (...args) => toNumbers(args).reduce((total, value) => total + value, 0),
  count: (...args) => toNumbers(args).length,
  abs: (...args) => Math.abs(toScriptNumber(args[0])),
  min: (...args) => Math.min(...toNumbers(args)),
  max: (...args) => Math.max(...toNumbers(args)),
  round: (...args) =>
    roundTo(toScriptNumber(args[0]), args.length > 1 ? toScriptNumber(args[1]) : 0),
  floor: (...args) => Math.floor(toScriptNumber(args[0])),
  ceil: (...args) => Math.ceil(toScriptNumber(args[0])),
  dvNit: (...args) => digitoVerificacion(toScriptNumber(args[0])),
};

// El objeto de valores no se nombra nunca a mano: {campo} se compila a __v["campo"]. El guion
// bajo doble es para que no choque con una variable del autor.
export const SCRIPT_VALUES_PARAM: string = "__v";

// `value` es lo que el usuario tenga escrito en el campo e `index` la repeticion dentro de un
// grupo repetible. Fuera de un grupo, `index` es 0.
export const SCRIPT_CONTEXT_PARAMS: string[] = [SCRIPT_VALUES_PARAM, "value", "index"];

// El orden manda: es el mismo con el que el runtime pasa los argumentos.
export const SCRIPT_PARAM_NAMES: string[] = [
  ...SCRIPT_CONTEXT_PARAMS,
  ...Object.keys(SCRIPT_HELPERS),
];
