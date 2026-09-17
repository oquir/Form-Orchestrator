// La rama de texto de buildSchemaFor (lib/zodSchema) es la unica que mete `pattern` en el schema:
// los campos de opciones van por z.enum o z.string sin regex, y estos cuatro tienen su propio caso.
// Una regex rota en uno de estos no viaja, asi que no hay nada que avisar.
export const TYPES_WITHOUT_PATTERN: string[] = ["number", "calculated", "checkbox", "file"];

export const PRELUDE_WHERE: string = "Script del formulario";

export const SCRIPT_SUBJECT: string = "El script";

export const UNNAMED_LABEL: string = "sin nombre";

export const PRELUDE_READS_FIELDS_MESSAGE: string =
  "El script del formulario no puede leer campos, y lee:";

export const UNKNOWN_REFS_HINT: string =
  "Si era un campo, ese cálculo no va a funcionar; si es una desestructuración, se puede ignorar.";

export const INVALID_PATTERN_MESSAGE: string = "La expresión regular no es válida:";

export const INVALID_OVERRIDE_PATTERN_MESSAGE: string =
  "La expresión regular de una validación condicional no es válida:";

export const INVALID_CONDITION_PATTERN_MESSAGE: string =
  "Una condición usa una expresión regular inválida:";

export const ORPHAN_MAPPING_MESSAGE: string =
  "Está mapeado a una ruta que no existe en el contrato:";

export const HOST_MAPPING_MESSAGE: string =
  "Está mapeado a una hoja que llena el aplicativo receptor:";

export const CYCLE_MESSAGE: string = "Ciclo entre campos:";

export const UNSUPPORTED_CSS_MESSAGE: string =
  "El CSS tiene declaraciones que el navegador no reconoce:";

export const UNSUPPORTED_TOOLTIP_CSS_MESSAGE: string =
  "El CSS del tooltip tiene declaraciones que el navegador no reconoce:";
