import { toScriptNumber, VALUE_HELPER_NAMES } from "../../constants/fieldScript";
import type { ScriptFunction } from "../../types/fieldScript";
import type { RuntimeContext } from "../../types/formRuntime";
import type { ValorAnual } from "../../types/valores";
import { anioDeTexto, buscarValores } from "../valoresAnuales/valoresAnuales";

// Los dos helpers que ponen la UVT y el salario minimo en el ambito de un script. Son impuros como
// los de fecha y por el mismo motivo: necesitan una tabla que no viaja en el export, asi que se
// arman por corrida cerrando sobre el RuntimeContext en vez de ser una constante de modulo.
//
// El contrato hacia el consumidor: `compiled` los llama por nombre, asi que del otro lado tienen
// que existir con estas mismas reglas. Alla los valores llegan por API; aca, del banco de valores.

// Sin ano se usa el del dia de hoy. Es lo que se quiere casi siempre: la sancion se liquida con la
// UVT del ano en que se liquida, no con la del ano gravable que se esta declarando.
function anioPedido(context: RuntimeContext, args: unknown[]): number {
  const pedido: number = toScriptNumber(args[0]);

  return pedido > 0 ? pedido : anioDeTexto(context.hoy);
}

// Devuelve null y no 0 cuando el ano no esta cargado, y esa es la diferencia que importa. Un 0
// haria desaparecer en silencio la sancion minima -- max(liquidada, 0 * 10) es la liquidada -- y
// nadie se enteraria. Con null el autor puede escribir su propio respaldo a la vista, que es lo que
// hace la plantilla: uvt() ?? 52374.
function resolver(
  context: RuntimeContext,
  args: unknown[],
  columna: "uvt" | "smmlv",
): number | null {
  // El contexto lo arma a mano quien consume el export, y una version suya anterior a este campo
  // no lo trae. Sin esta guarda seria un TypeError adentro del script del contribuyente en vez de
  // un "no hay dato", que es lo que realmente pasa.
  const tabla: ValorAnual[] = Array.isArray(context.valores) ? context.valores : [];
  const fila: ValorAnual | null = buscarValores(tabla, anioPedido(context, args));

  return fila === null ? null : fila[columna];
}

// El orden sale de VALUE_HELPER_NAMES y no de escribirlo dos veces, la misma disciplina que
// buildDateHelpers: agregar uno en un lado y olvidarlo en el otro correria todos los argumentos
// siguientes sin que nada avise.
export function buildValueHelpers(context: RuntimeContext): ScriptFunction[] {
  const porNombre: Record<string, ScriptFunction> = {
    // UVT del ano pedido, o del ano en curso si no se pasa ninguno.
    uvt: (...args: unknown[]) => resolver(context, args, "uvt"),

    // Salario minimo mensual legal vigente, con la misma regla.
    smmlv: (...args: unknown[]) => resolver(context, args, "smmlv"),
  };

  return VALUE_HELPER_NAMES.map((name) => porNombre[name]);
}
