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
