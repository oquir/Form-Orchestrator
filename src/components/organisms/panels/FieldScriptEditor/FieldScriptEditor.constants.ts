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

// Los de fecha no se explican solos como sum o abs: llevan argumentos y dependen de la tabla
// cargada en la pestaña Fechas, asi que se dice donde sale el dato y que pasa si no esta.
export const DATE_HELPERS_HINT: string =
  "fechaLimite(año, periodo, documento) da la fecha máxima de presentación; diasDeMora(…) los días de atraso y mesesDeMora(…) los meses o fracción, 0 si está en fecha. Salen de la pestaña Fechas; sin tabla cargada devuelven null y 0.";
