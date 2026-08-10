import { toScriptNumber } from "../../constants/fieldScript";
import { NUMERIC_FIELD_TYPES } from "../../constants/fieldTypes";
import type { ScriptFunction, ScriptFunctionResult } from "../../types/fieldScript";
import { buildScriptFunction, composeScriptBody } from "../fieldScript/fieldScript";

// Cache de compilacion, indexada por el cuerpo ya compuesto -- preludio incluido -- y no por el
// nombre del campo, igual que hydrateFieldSchemas se indexa por el texto del schema. Dos campos
// con el mismo script comparten la funcion, y sobre todo: resolveRuntime llama al calculo una vez
// por ambito en cada tecla, asi que sin cache habria un new Function por campo por pulsacion.
//
// Vive a nivel de modulo a proposito. Es lo unico que sobrevive entre llamadas, que es justo lo
// que hace falta; crece con la cantidad de textos distintos que se escriban en la sesion, que en
// la practica son unas pocas decenas de cadenas cortas.
const CACHE: Map<string, ScriptFunction | null> = new Map();

// El error de compilacion se guarda aparte porque en la cache un fallo es null, y sin esto habria
// que recompilar en cada tecla justo el script que esta roto -- que es el caso mas frecuente
// mientras alguien escribe.
const ERRORS: Map<string, string> = new Map();

export function compileCached(compiled: string, prelude: string): ScriptFunctionResult {
  const body: string = composeScriptBody(compiled, prelude);
  const cached: ScriptFunction | null | undefined = CACHE.get(body);

  if (cached !== undefined)
    return { fn: cached, error: cached ? null : (ERRORS.get(body) ?? null) };

  const built: ScriptFunctionResult = buildScriptFunction(body);
  CACHE.set(body, built.fn);
  if (built.error) ERRORS.set(body, built.error);

  return built;
}

// Lo que ve el script bajo {campo}, coaccionado por el tipo del campo que lo declara. Sin esto
// {a} + {b} sobre dos numeros concatena los textos que vienen del input -- "5" + "3" es "53" --,
// que es el peor error posible en una calculadora de impuestos porque no falla, miente.
export function coerceForScript(value: unknown, type: string): unknown {
  // La columna de un grupo repetible llega como array; se coacciona elemento por elemento con el
  // tipo de la columna, no del array.
  if (Array.isArray(value)) return value.map((item) => coerceForScript(item, type));
  if (NUMERIC_FIELD_TYPES.includes(type)) return toScriptNumber(value);
  if (type === "checkbox") return Boolean(value);

  return value;
}
