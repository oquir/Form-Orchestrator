import { SCRIPT_PARAM_NAMES } from "../../constants/fieldScript";
import type {
  PreludeValidation,
  ScriptCompileResult,
  ScriptFunction,
  ScriptFunctionResult,
  ScriptRef,
  ScriptValidation,
} from "../../types/fieldScript";
import { scanScript } from "./fieldScript.utils";

// API publica del script de campo: de texto con {campo} a cuerpo de funcion ejecutable, mas las
// dependencias que ese texto declara al leerlas. Nada de React ni del store entra aca.
//
// lib/formula existia justamente para no ejecutar texto del usuario. Esto hace lo contrario y es
// deliberado: el calculo de un campo pasa a ser codigo, y quien consuma el export lo va a correr
// con new Function igual que ya corre los schemas de Zod. De este lado no se ejecuta nada, solo
// se compila y se valida; ejecutar es cosa del runtime.
//
// Ninguna funcion de aca lanza: el error viaja en el resultado, porque el editor las llama en
// cada tecla y necesita pintar el mensaje sin envolver todo en try/catch.

export function compileScript(source: string, knownNames: Set<string>): ScriptCompileResult {
  const { code, refs } = scanScript(source, knownNames);
  const reads: string[] = [];
  const unknown: string[] = [];
  const seen = new Set<string>();

  for (const ref of refs) {
    if (seen.has(ref.name)) continue;
    seen.add(ref.name);

    if (ref.known) {
      reads.push(ref.name);
      continue;
    }

    unknown.push(ref.name);
  }

  return { code, refs, reads, unknown };
}

// El preludio se pega delante del cuerpo en vez de correrse aparte: asi sus funciones quedan en
// ambito sin ceremonia -- se declaran y ya --, y como el compilado se cachea por texto, repetirlo
// en cada campo no cuesta nada. Que devuelva un objeto de helpers era la alternativa y obliga a
// un `return` que nadie recuerda escribir.
export function composeScriptBody(code: string, prelude?: string): string {
  const shared: string = prelude?.trim() ?? "";

  return shared.length === 0 ? code : `${shared}\n${code}`;
}

// Cuantas lineas mete el preludio por delante. El editor las resta para no subrayar la linea
// equivocada del script del campo.
export function preludeLineOffset(prelude?: string): number {
  const shared: string = prelude?.trim() ?? "";

  return shared.length === 0 ? 0 : shared.split("\n").length;
}

export function buildScriptFunction(body: string): ScriptFunctionResult {
  try {
    return { fn: new Function(...SCRIPT_PARAM_NAMES, body) as ScriptFunction, error: null };
  } catch (error) {
    return { fn: null, error: error instanceof Error ? error.message : "El script no compila." };
  }
}

export function checkScriptSyntax(body: string): string | null {
  return buildScriptFunction(body).error;
}

export function validateFieldScript(
  source: string,
  knownNames: Set<string>,
  prelude?: string,
): ScriptValidation {
  const compiled: ScriptCompileResult = compileScript(source, knownNames);
  const isEmpty: boolean = source.trim().length === 0;

  if (isEmpty) return { ...compiled, error: null, isEmpty, isValid: true };

  // Las referencias desconocidas no invalidan nada: {a} puede ser una desestructuracion legitima.
  // Se reportan aparte, como aviso, y quien pinte el panel decide como mostrarlas.
  const ownError: string | null = checkScriptSyntax(compiled.code);
  if (ownError) return { ...compiled, error: ownError, isEmpty, isValid: false };

  // El cuerpo solo se comprueba primero para poder decir de quien es el problema: sin este paso,
  // un preludio roto se reporta como error de los cuarenta campos del formulario.
  const body: string = composeScriptBody(compiled.code, prelude);
  const sharedError: string | null = body === compiled.code ? null : checkScriptSyntax(body);

  return {
    ...compiled,
    error: sharedError === null ? null : `El script del formulario no compila: ${sharedError}`,
    isEmpty,
    isValid: sharedError === null,
  };
}

// El preludio no puede leer campos: es funciones y constantes puras, y los valores entran por
// argumento. Sin esta regla habria que decidir que significa {ingresos} fuera de todo ambito, y
// dentro de un grupo repetible esa pregunta no tiene una respuesta unica.
export function validatePrelude(source: string, knownNames: Set<string>): PreludeValidation {
  // El codigo sustituido se descarta: escanear es la unica forma de ver si nombro algun campo.
  const refs: ScriptRef[] = scanScript(source, knownNames).refs.filter((ref) => ref.known);
  const isEmpty: boolean = source.trim().length === 0;
  const error: string | null = isEmpty ? null : checkScriptSyntax(source);

  return { refs, error, isEmpty, isValid: error === null && refs.length === 0 };
}

// Un resultado no finito es "no se pudo calcular" y sale como null, que es exactamente lo que
// hacia la division por cero en el lenguaje de formulas. Sin esto un Infinity se guardaria como
// valor del campo y viajaria al payload.
export function normalizeScriptResult(value: unknown): unknown {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  return value;
}
