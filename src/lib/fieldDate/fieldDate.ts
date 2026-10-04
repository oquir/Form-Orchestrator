import { DATE_FIELD_TYPE } from "../../constants/fieldTypes";
import type { DateCapableField, DateFormatId, DateRangeValue } from "../../types/fieldDate";
import { datePattern, formatIsoValue } from "../dateFormat/dateFormat";
import { DATE_INPUT_MAX, DATETIME_INPUT_MAX } from "./fieldDate.constants";

// Un campo fecha guarda una sola fecha o un rango, y cada una con o sin hora. Las dos propiedades
// son independientes y ausentes por defecto: una sola fecha sin hora, que es lo que era todo campo
// fecha antes de que existieran. A diferencia de inlineOptions no son presentacion: cambian la
// forma del valor -- AAAA-MM-DD, AAAA-MM-DDTHH:mm o un objeto { desde, hasta } con cualquiera de
// los dos --, y con ella el schema, las condiciones que tienen sentido y a que hoja puede ir.

export function isDateFieldType(type: string): boolean {
  return type === DATE_FIELD_TYPE;
}

export function isDateRangeField(field: DateCapableField): boolean {
  return Boolean(field.dateRange) && isDateFieldType(field.type);
}

// La hora la pide el municipio, no todos: por eso es opcional y no la forma normal del campo.
export function includesTime(field: DateCapableField): boolean {
  return Boolean(field.includesTime) && isDateFieldType(field.type);
}

export function exportableDateRange(field: DateCapableField): true | undefined {
  return isDateRangeField(field) ? true : undefined;
}

export function exportableIncludesTime(field: DateCapableField): true | undefined {
  return includesTime(field) ? true : undefined;
}

// datetime-local y no datetime: el valor es la hora de reloj del contribuyente, sin huso. Es lo que
// se escribe en un formulario de un solo pais; convertirla a UTC le cambiaria el dia a quien
// declara a las 11 de la noche.
export function dateInputType(field: DateCapableField): "date" | "datetime-local" {
  return includesTime(field) ? "datetime-local" : "date";
}

export function dateInputMax(field: DateCapableField): string {
  return includesTime(field) ? DATETIME_INPUT_MAX : DATE_INPUT_MAX;
}

// Ausente es el input del navegador, en su idioma, y AAAA-MM-DD hacia la API: lo que era todo campo
// fecha antes de que existiera el formato.
export function dateFormatOf(field: DateCapableField): DateFormatId | undefined {
  return isDateFieldType(field.type) ? field.dateFormat : undefined;
}

export function exportableDateFormat(field: DateCapableField): DateFormatId | undefined {
  return dateFormatOf(field);
}

// El valor como lo recibe la API: cada fecha en el formato del campo, y en un rango las dos puntas.
// Lo que no es un valor completo (un texto a medio escribir) sale tal cual; el schema ya lo frena
// antes de que se pueda enviar.
export function formatDateForPayload(field: DateCapableField, value: unknown): unknown {
  const format: DateFormatId | undefined = dateFormatOf(field);
  if (format === undefined) return value;

  const withTime: boolean = includesTime(field);
  const pattern: string = datePattern(format, withTime);
  const formatOne = (text: string): string => formatIsoValue(text, pattern, withTime) ?? text;

  if (isDateRangeField(field)) {
    if (typeof value !== "object" || value === null) return value;

    const range: DateRangeValue = readDateRange(value);

    return { desde: formatOne(range.desde), hasta: formatOne(range.hasta) };
  }

  return typeof value === "string" ? formatOne(value) : value;
}

// Lee el rango de lo que haya en el estado sin confiar en su forma: un campo que acaba de pasar de
// fecha unica a rango todavia tiene un texto, y uno sin tocar no tiene nada.
export function readDateRange(value: unknown): DateRangeValue {
  if (typeof value !== "object" || value === null) return { desde: "", hasta: "" };

  const record = value as Partial<Record<keyof DateRangeValue, unknown>>;

  return {
    desde: typeof record.desde === "string" ? record.desde : "",
    hasta: typeof record.hasta === "string" ? record.hasta : "",
  };
}

// Las dos puntas vacias son "sin valor", no un objeto con dos textos vacios: es lo que hace que
// isEmpty se cumpla y que un rango opcional sin llenar pase el schema.
export function toDateRangeValue(range: DateRangeValue): DateRangeValue | undefined {
  return range.desde === "" && range.hasta === "" ? undefined : range;
}
