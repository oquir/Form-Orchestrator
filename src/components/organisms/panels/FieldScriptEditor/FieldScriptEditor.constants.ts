import { SCRIPT_HELPER_NAMES } from "../../../../constants/fieldScript";

export const HINT_CLASSES: string = "text-[11px] text-fg-subtle";

export const ERROR_CLASSES: string = "text-[11px] text-danger";

export const WARNING_CLASSES: string = "text-[11px] text-warning";

export const READS_CLASSES: string =
  "rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-fg-muted";

export const SCRIPT_PLACEHOLDER: string =
  "return {total_ingresos_nacionales} - {ingresos_fuera_municipio};";

export const SCRIPT_HINT: string =
  "Escribí el cálculo y devolvelo con return. {campo} lee el valor de otro campo. Un return undefined deja lo que haya escrito el usuario.";

export const SCRIPT_SCOPE_HINT: string = `En ámbito: value (el valor actual), index (la repetición dentro de un grupo) y ${SCRIPT_HELPER_NAMES.join(", ")}.`;

// Los que dependen de una tabla no se explican solos como sum o abs: llevan argumentos y salen de
// datos cargados en otra pestaña, asi que se dice de donde salen y que devuelven si no estan.
export const DATE_HELPERS_HINT: string =
  "fechaLimite(año, periodo, documento) da la fecha máxima de presentación; diasDeMora(…) los días de atraso y mesesDeMora(…) los meses o fracción, 0 si está en fecha. Salen de la pestaña Fechas; sin tabla cargada devuelven null y 0.";

// El null es lo que hay que saber: un 0 haria desaparecer en silencio cualquier piso o tope escrito
// en UVT, asi que el respaldo lo pone el autor y queda a la vista en el script.
export const VALUE_HELPERS_HINT: string =
  "uvt(año) y smmlv(año) dan la UVT y el salario mínimo; sin año usan el que corre. Salen de la pestaña Catálogos y devuelven null si ese año no está cargado, así que conviene escribir uvt() ?? 52374.";
