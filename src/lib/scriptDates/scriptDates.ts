import { DATE_HELPER_NAMES, toScriptNumber } from "../../constants/fieldScript";
import type { ScriptFunction } from "../../types/fieldScript";
import type { RuntimeContext } from "../../types/formRuntime";
import { buscarFechaLimite, diasEntre } from "../maxDates/maxDates";

// Los dos helpers de fecha que un script tiene en ambito. Son los unicos que no son puros: el resto
// vive en constants/fieldScript porque le alcanza con sus argumentos, y estos necesitan la tabla de
// vencimientos, que no esta en el export. Por eso se construyen por corrida, cerrando sobre el
// contexto, en vez de ser una constante de modulo.
//
// El contrato hacia el consumidor: `compiled` los va a llamar por nombre, asi que del otro lado
// tienen que existir con estas mismas reglas. Es el mismo acuerdo coordinado que ya rige para
// logic.script -- quien escribe el formulario y quien lo consume son la misma persona.

const PERIODO_POR_DEFECTO: number = 1;

function comoTexto(valor: unknown): string {
  return valor === undefined || valor === null ? "" : String(valor);
}

// El periodo cae en 1 cuando no lo pasan o llega vacio, que es el caso de toda declaracion anual.
function comoPeriodo(valor: unknown): number {
  const numero: number = toScriptNumber(valor);

  return numero > 0 ? numero : PERIODO_POR_DEFECTO;
}

function resolver(context: RuntimeContext, args: unknown[]): string | null {
  const anio: number = toScriptNumber(args[0]);
  if (anio <= 0) return null;

  return buscarFechaLimite(context.reglas, anio, comoPeriodo(args[1]), comoTexto(args[2])) ?? null;
}

// El orden sale de DATE_HELPER_NAMES y no de escribirlo dos veces: es la misma disciplina con la que
// SCRIPT_HELPER_VALUES deriva de SCRIPT_HELPERS. Agregar uno en un lado y olvidarlo en el otro
// correria todos los argumentos siguientes sin que nada avise.
export function buildDateHelpers(context: RuntimeContext): ScriptFunction[] {
  const porNombre: Record<string, ScriptFunction> = {
    // La fecha maxima, o null si no hay tabla para ese ano, periodo o digito.
    fechaLimite: (...args: unknown[]) => resolver(context, args),

    // Dias de atraso, 0 si esta en fecha. Tambien 0 cuando no hay fecha con que comparar, y eso es
    // deliberado: sin tabla cargada la alternativa seria NaN, que apagaria en silencio la cadena de
    // renglones que venga detras. Y una sancion no puede nacer de un dato que falta.
    diasDeMora: (...args: unknown[]) => {
      const limite: string | null = resolver(context, args);
      if (limite === null) return 0;

      const dias: number | null = diasEntre(limite, context.hoy);

      return dias === null || dias <= 0 ? 0 : dias;
    },
  };

  return DATE_HELPER_NAMES.map((name) => porNombre[name]);
}
