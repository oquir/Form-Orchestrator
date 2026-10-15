import { v4 as uuidv4 } from "uuid";
import type { FieldValidationOverride } from "../../types/field";

// Manipulacion de las validaciones condicionales de un campo. El orden de la lista es semantico:
// al validar gana el primer override cuya condicion se cumpla, y si ninguna se cumple queda la
// validacion de base. Mantener este archivo sin React ni store, como el resto de lib/.

export function createValidationOverride(): FieldValidationOverride {
  // Nace apuntando a nada: el editor obliga a elegir el campo observado antes de que sirva, y
  // exportarlo asi tampoco hace dano porque resolveValidations descarta los que no resuelven.
  return {
    id: uuidv4(),
    when: { fieldId: "", operator: "equals", value: "" },
    validations: {},
  };
}

// Un override que observaba al campo borrado se elimina entero. No hay medio override util: sin
// condicion aplicaria siempre, y eso convertiria una regla condicional en la validacion de base.
export function pruneOverridesReferencing(
  overrides: FieldValidationOverride[] | undefined,
  fieldId: string,
): FieldValidationOverride[] | undefined {
  if (!overrides) return undefined;

  return overrides.filter((override) => override.when.fieldId !== fieldId);
}
