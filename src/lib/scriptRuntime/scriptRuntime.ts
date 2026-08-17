import { SCRIPT_HELPER_VALUES } from "../../constants/fieldScript";
import type { ScriptFunctionResult } from "../../types/fieldScript";
import type { RuntimeContext, RuntimeModel, RuntimeValues } from "../../types/formRuntime";
import type { ScriptRunResult } from "../../types/scriptRuntime";
import { normalizeScriptResult } from "../fieldScript/fieldScript";
import { buildDateHelpers } from "../scriptDates/scriptDates";
import { buildValueHelpers } from "../scriptValores/scriptValores";
import { coerceForScript, compileCached, EMPTY_CONTEXT } from "./scriptRuntime.utils";

// Ejecuta el script de un campo. Es el unico sitio del proyecto que corre codigo del autor, y lo
// hace con new Function igual que zodHydrate con los schemas: no hay aislamiento real, la garantia
// es que quien escribe el script y quien consume el export son la misma persona.
//
// Lo que si hay es contencion: un script que revienta se reporta como problema de ese campo y no
// tumba el formulario. Lo que no se puede contener es un bucle infinito, que congela la pestaña;
// la unica defensa seria un worker con timeout y no la vale hoy.

export function runFieldScript(
  compiled: string,
  prelude: string,
  values: RuntimeValues,
  value: unknown,
  index: number,
  context: RuntimeContext = EMPTY_CONTEXT,
): ScriptRunResult {
  const built: ScriptFunctionResult = compileCached(compiled, prelude);
  if (!built.fn) return { value: undefined, error: built.error };

  try {
    // Los que dependen del contexto van al final y se arman por corrida: cierran sobre la tabla de
    // vencimientos y la de valores anuales, que no vienen en el export. El orden es el de
    // SCRIPT_PARAM_NAMES -- primero los de fecha y despues los de valor -- que los pone en el mismo
    // lugar; ver CONTEXT_HELPER_NAMES, de donde salen las dos listas.
    const result: unknown = built.fn(
      values,
      value,
      index,
      ...SCRIPT_HELPER_VALUES,
      ...buildDateHelpers(context),
      ...buildValueHelpers(context),
    );

    return { value: normalizeScriptResult(result), error: null };
  } catch (error) {
    return { value: undefined, error: error instanceof Error ? error.message : String(error) };
  }
}

// La vista que ve el script, con cada valor coaccionado segun el tipo del campo que lo declara.
// Se arma entera de una vez en vez de campo a campo porque un script lee a sus vecinos, no solo
// al suyo, y un vecino sin coaccionar es un "5" donde deberia haber un 5.
export function coerceValues(values: RuntimeValues, model: RuntimeModel): RuntimeValues {
  const coerced: RuntimeValues = {};

  // Se recorre el modelo entero y no solo las claves que trae `values`: un campo que el usuario
  // no toco todavia no tiene clave, y sin esta vuelta {campo} daria undefined en vez de 0. En una
  // resta ese undefined se vuelve NaN y apaga toda la cadena de renglones que venga detras, que
  // es exactamente como el renglon 35 -- el que no tiene formula -- dejaba en null al 38.
  for (const [name, field] of model.fieldsByName) {
    coerced[name] = coerceForScript(values[name], field.type);
  }

  // Lo que venga por fuera del modelo pasa tal cual: no hay tipo con el que coaccionarlo.
  for (const name of Object.keys(values)) {
    if (!model.fieldsByName.has(name)) coerced[name] = values[name];
  }

  return coerced;
}

export { coerceForScript };
