import { CONTACT_FIELD_TYPES, EMAIL_FIELD_TYPE, TEL_FIELD_TYPE } from "../../constants/fieldTypes";
import type { FieldValidationRules } from "../../types/field";
import type { PatternRule, PhoneKind } from "../../types/fieldContact";
import { EMAIL_FORMAT, PHONE_FORMATS } from "./fieldContact.constants";
import type { ContactField } from "./fieldContact.types";

// Telefono y correo: texto con un formato de fabrica. No son otro valor -- siguen siendo un string,
// se mapean a hojas string y se validan con z.string() -- sino un patron que viene puesto, mas el
// type del input, que en el celular abre el teclado que corresponde. El telefono ademas elige que
// numero pide -- celular, fijo o fax, que es cualquiera de los dos
// con extension --, y cada uno trae su patron.
//
// El patron de fabrica no se guarda en el campo: sale de aca al armar el schema. Asi un borrador
// viejo o uno recien soltado validan igual, y corregir el patron alcanza a todos los formularios
// sin migrar nada. El que escriba el autor lo reemplaza entero, no se suma: dos regex sobre el
// mismo texto darian dos mensajes para un solo error.

export function isContactField(type: string): boolean {
  return CONTACT_FIELD_TYPES.includes(type);
}

export function isPhoneField(type: string): boolean {
  return type === TEL_FIELD_TYPE;
}

// Ausente es celular: es lo que pide casi todo formulario, y lo que piden los dos telefonos de la
// plantilla ICA, que asi no tienen que declararlo.
export function phoneKindOf(field: ContactField): PhoneKind {
  return field.phoneKind ?? "celular";
}

export function builtInFormatOf(field: ContactField): PatternRule | undefined {
  if (isPhoneField(field.type)) return PHONE_FORMATS[phoneKindOf(field)];
  if (field.type === EMAIL_FIELD_TYPE) return EMAIL_FORMAT;

  return undefined;
}

// El patron que de verdad se aplica. Un patron propio sin mensaje toma el del tipo: "Ingrese un
// correo valido" sigue siendo cierto aunque el autor haya cambiado la regex.
export function effectivePattern(
  field: ContactField,
  rules: FieldValidationRules,
): PatternRule | undefined {
  const builtIn: PatternRule | undefined = builtInFormatOf(field);
  const pattern: string | undefined = rules.pattern || builtIn?.pattern;

  if (!pattern) return undefined;

  return { pattern, message: rules.message || builtIn?.message };
}
