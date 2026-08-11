import { NUMERIC_FIELD_TYPES } from "../../constants/fieldTypes";
import type { ClampResult, SignedField } from "./fieldSign.types";

// Si un campo numerico admite valores negativos. Se aplica en dos momentos distintos, porque hay
// dos maneras de que aparezca un negativo: al usuario no se le deja tipear el signo -- eso vive en
// el filtro de numberFormat -- y a lo que produce un script se le recorta el resultado a 0.
//
// Recorta el valor, no la vista. Mostrar 0 mientras se guarda -1.000.000 dejaria la pantalla y el
// payload diciendo cosas distintas, y el campo de abajo leeria el negativo que nadie ve.

export function supportsSign(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type);
}

// La polaridad va al reves que rounding y formatted, donde ausente es apagado: aca ausente
// significa que SI admite negativos. Es a proposito. Si la ausencia restringiera, todo borrador
// ya guardado y todo campo recien soltado de la paleta empezarian a recortar en silencio, y un
// -1.000.000 vuelto 0 sin que nadie lo pidiera se descubre tarde y mal.
//
// El contrato hacia el consumidor es esa misma frase: si `allowsNegative` no viene, se admiten;
// solo `allowsNegative: false` restringe.
export function allowsNegative(field: SignedField): boolean {
  return field.allowsNegative !== false;
}

// Solo viaja el false, que es el que restringe. El true es el default y no dice nada.
export function exportableAllowsNegative(field: SignedField): false | undefined {
  return field.allowsNegative === false && supportsSign(field.type) ? false : undefined;
}

export function clampNegative(field: SignedField, raw: unknown): ClampResult {
  if (allowsNegative(field) || !supportsSign(field.type)) return { value: raw, clamped: false };
  // El vacio no es cero, misma guarda que en el redondeo: recortarlo dejaria un 0 declarado
  // sobre un campo que nadie toco.
  if (raw === undefined || raw === null || raw === "") return { value: raw, clamped: false };

  const parsed: number = Number(raw);
  if (!Number.isFinite(parsed) || parsed >= 0) return { value: raw, clamped: false };

  return { value: 0, clamped: true };
}
