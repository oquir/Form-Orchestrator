import type {
  CanvasField,
  FieldOption,
  FieldValidationOverride,
  FieldValidationRules,
} from "../../types/field";
import type { DateBound, DateBoundSide } from "../../types/fieldDate";
import type { RepeatableGroup } from "../../types/formStructure";
import { boundExpression, boundMessage, isCompleteBound } from "../dateBound/dateBound";

import { includesTime, isDateRangeField } from "../fieldDate/fieldDate";
import { isPresentationalField } from "../fieldKind/fieldKind";
import { effectiveMaxLength } from "../fieldLength/fieldLength";
import {
  exportableOptions,
  isMultiValueField,
  isOptionBasedField,
} from "../fieldOptions/fieldOptions";
import {
  DATE_VALUE_MESSAGE,
  DATE_VALUE_PATTERN,
  DATETIME_VALUE_MESSAGE,
  DATETIME_VALUE_PATTERN,
  RANGE_END_INVALID,
  RANGE_END_MISSING,
  RANGE_ORDER_MESSAGE,
  RANGE_START_INVALID,
  RANGE_START_MISSING,
} from "./zodSchema.constants";

// Genera el schema de Zod como texto, que es lo unico que viaja en el export. El consumidor lo
// ejecuta con new Function, asi que lo de aca tiene que ser una expresion valida por si sola.
// Ojo: no sabe nada de visibleWhen. Un campo obligatorio y oculto igual exporta su `.min(1)`,
// porque cuando se ve la exigencia es real; es el consumidor quien debe sacarlo del resolver.

export function buildGroupZodSchema(group: RepeatableGroup, fields: CanvasField[]): string {
  const shape: string = fields
    .filter((field) => !isPresentationalField(field.type))
    .map((field) => `${JSON.stringify(field.name)}: ${buildZodSchema(field)}`)
    .join(", ");

  return `z.array(z.object({ ${shape} })).min(${group.min}).max(${group.max})`;
}

export function buildZodSchema(field: CanvasField): string {
  return buildSchemaFor(field, field.validations);
}

// El schema de una variante condicional. Las reglas del override se fusionan sobre las de base:
// declarar solo `pattern` cambia el patron y deja el resto como estaba.
export function buildOverrideZodSchema(
  field: CanvasField,
  override: FieldValidationOverride,
): string {
  return buildSchemaFor(field, mergeValidationRules(field.validations, override.validations));
}

// Se ignoran las claves en undefined en vez de dejar que el spread las escriba: un override que
// trae `pattern: undefined` quiere decir "no toco el patron", no "borro el de base".
function mergeValidationRules(
  base: FieldValidationRules,
  patch: FieldValidationRules,
): FieldValidationRules {
  const merged: FieldValidationRules = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) (merged as Record<string, unknown>)[key] = value;
  }

  return merged;
}

function dateSchema(pattern: string, invalidMessage: string, missingMessage?: string): string {
  const missing: string =
    missingMessage === undefined ? "" : `.min(1, { message: ${JSON.stringify(missingMessage)} })`;

  return `z.string()${missing}.regex(new RegExp(${JSON.stringify(pattern)}), { message: ${JSON.stringify(invalidMessage)} })`;
}

// Un limite como refine. Se compara solo la fecha -- los diez primeros caracteres --, asi que con
// hora el limite es por dia: "no posterior a hoy" acepta hoy a las 11 de la noche.
function boundRefine(
  accessor: string,
  bound: DateBound | undefined,
  side: DateBoundSide,
  subject: string,
): string {
  if (!isCompleteBound(bound)) return "";

  const operator: string = side === "min" ? ">=" : "<=";
  const message: string = JSON.stringify(boundMessage(bound, side, subject));

  return `.refine((v) => ${accessor}.slice(0, 10) ${operator} ${boundExpression(bound)}, { message: ${message} })`;
}

// Las dos puntas son obligatorias dentro del rango aunque el campo sea opcional: un rango opcional
// sin llenar llega como undefined y pasa por el .optional(), pero uno a medias es un error. El orden
// se compara como texto, que con AAAA-MM-DD y AAAA-MM-DDTHH:mm da lo mismo que comparar fechas.
// Los limites van a la punta que pueden romper: con el orden ya exigido, si la inicial no es
// anterior al minimo la final tampoco, y si la final no pasa del maximo la inicial tampoco.
function dateRangeSchema(pattern: string, v: FieldValidationRules): string {
  const start: string = dateSchema(pattern, RANGE_START_INVALID, RANGE_START_MISSING);
  const end: string = dateSchema(pattern, RANGE_END_INVALID, RANGE_END_MISSING);
  const bounds: string =
    boundRefine("v.desde", v.minDate, "min", "La fecha inicial") +
    boundRefine("v.hasta", v.maxDate, "max", "La fecha final");

  return `z.object({ desde: ${start}, hasta: ${end} }).refine((r) => r.desde <= r.hasta, { message: ${JSON.stringify(RANGE_ORDER_MESSAGE)} })${bounds}`;
}

function dateFieldSchema(field: CanvasField, v: FieldValidationRules): string {
  const withTime: boolean = includesTime(field);
  const pattern: string = withTime ? DATETIME_VALUE_PATTERN : DATE_VALUE_PATTERN;

  if (isDateRangeField(field)) return dateRangeSchema(pattern, v);

  const base: string = dateSchema(pattern, withTime ? DATETIME_VALUE_MESSAGE : DATE_VALUE_MESSAGE);

  return (
    base +
    boundRefine("v", v.minDate, "min", "La fecha") +
    boundRefine("v", v.maxDate, "max", "La fecha")
  );
}

function buildSchemaFor(field: CanvasField, v: FieldValidationRules): string {
  let schema: string;

  if (isOptionBasedField(field.type)) {
    // Solo se enumeran los valores de un campo excluido del payload, que es el unico caso en que
    // el builder los conoce. Uno mapeado recibe sus opciones del catalogo en tiempo de ejecucion,
    // asi que cae en z.string(): no se puede enumerar lo que no se ha visto.
    const options: FieldOption[] = exportableOptions(field) ?? [];
    const ids: string[] = options.map((option) => JSON.stringify(option.id));
    schema = ids.length > 0 ? `z.enum([${ids.join(", ")}])` : "z.string()";

    if (isMultiValueField(field.type)) {
      return v.required ? `z.array(${schema}).min(1)` : `z.array(${schema}).optional()`;
    }

    return v.required ? schema : `${schema}.optional()`;
  }

  switch (field.type) {
    case "number":
    case "calculated": {
      schema = "z.number()";
      if (v.min !== undefined) schema += `.min(${v.min})`;
      if (v.max !== undefined) schema += `.max(${v.max})`;
      // El tope de longitud de un numero son digitos de la parte entera, no caracteres ni valor.
      // No hay forma de decirlo con .max(): 999999999,99 tiene nueve digitos enteros y se pasaria
      // de cualquier tope de valor que se escriba, asi que va como refine.
      const digits: number | undefined = effectiveMaxLength(v.maxLength);
      if (digits !== undefined) {
        schema += `.refine((n) => Math.abs(Math.trunc(n)).toString().length <= ${digits}, { message: "Máximo ${digits} dígitos" })`;
      }
      break;
    }
    case "checkbox":
      schema = "z.boolean()";
      break;
    case "date":
      schema = dateFieldSchema(field, v);
      break;
    case "file": {
      const config = field.fileConfig ?? { acceptedFormats: [], maxSizeMB: 10 };
      const maxBytes = Math.floor(config.maxSizeMB * 1024 * 1024);
      schema = "z.instanceof(File)";
      schema += `.refine((f) => f.size <= ${maxBytes}, { message: "Máximo ${config.maxSizeMB}MB" })`;
      if (config.acceptedFormats.length > 0) {
        const acceptedJson = JSON.stringify(config.acceptedFormats);
        schema += `.refine((f) => { const accepted = ${acceptedJson}; return accepted.some((a) => a.startsWith(".") ? f.name.toLowerCase().endsWith(a.toLowerCase()) : a.endsWith("/*") ? f.type.startsWith(a.slice(0, -1)) : f.type === a); }, { message: "Formato no permitido" })`;
      }
      break;
    }
    default: {
      schema = "z.string()";
      if (v.minLength !== undefined) schema += `.min(${v.minLength})`;
      // Por effectiveMaxLength y no por v.maxLength directo: es el mismo numero que el input va a
      // aplicar como maxLength nativo, y leerlo distinto en cada lado los pondria a discrepar.
      const chars: number | undefined = effectiveMaxLength(v.maxLength);
      if (chars !== undefined) schema += `.max(${chars})`;
      if (v.pattern) {
        const source: string = JSON.stringify(v.pattern);
        const message: string = v.message ? `, { message: ${JSON.stringify(v.message)} }` : "";
        schema += `.regex(new RegExp(${source})${message})`;
      }
    }
  }

  // Que un campo sea obligatorio se expresa por omision: no se agrega `.optional()`. Es lo que
  // luego lee isRequiredBySchema para pintar el asterisco, ya que `required` no se exporta.
  if (!v.required && field.type !== "checkbox") {
    schema += ".optional()";
  }

  return schema;
}
