import { MULTI_VALUE_FIELD_TYPES } from "../../constants/fieldTypes";
import type { ExportedField } from "../../types/exportForm";

// La clave con la que se indexa un error. Un campo suelto va por nombre; uno dentro de un grupo
// repetible necesita ademas el grupo y la repeticion, porque el mismo nombre aparece en cada fila.
export function fieldKey(name: string, groupId?: string, index?: number): string {
  return groupId === undefined || index === undefined ? name : `${groupId}:${index}:${name}`;
}

// El export no lleva `required`: solo el string del schema. Que un campo sea obligatorio hay que
// deducirlo de la ausencia de `.optional()`, que es lo unico que puede hacer el consumidor.
export function isRequiredBySchema(field: ExportedField): boolean {
  const source: string | undefined = field.validations.zodSchema;
  // El checkbox queda fuera porque buildZodSchema nunca le agrega `.optional()`: sin esta
  // excepcion todo checkbox se leeria como obligatorio y llevaria asterisco.
  if (!source || field.type === "checkbox") return false;

  return !source.trim().endsWith(".optional()");
}

// El export solo lleva el zodSchema como string, asi que un `number` espera un number de verdad
// y un input entrega string. El consumidor tiene que hacer esta misma conversion.
export function coerceValue(field: ExportedField, raw: unknown): unknown {
  if (MULTI_VALUE_FIELD_TYPES.includes(field.type)) {
    if (raw === undefined || raw === null) return undefined;
    return Array.isArray(raw) ? raw : [raw];
  }

  if (field.type === "checkbox") return Boolean(raw);

  if (field.type === "number" || field.type === "calculated") {
    if (raw === undefined || raw === null || raw === "") return undefined;
    if (typeof raw === "number") return raw;
    const parsed: number = Number(raw);
    return Number.isNaN(parsed) ? raw : parsed;
  }

  // El string vacio pasa a undefined para que `.optional()` lo acepte: un input que el usuario
  // nunca toco y uno que vacio son lo mismo de cara a la validacion.
  if (raw === "" || raw === null) return undefined;

  return raw;
}
