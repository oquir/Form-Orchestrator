// El valor de un campo fecha es el texto que entrega el input: AAAA-MM-DD, o AAAA-MM-DDTHH:mm si
// pide hora, sin huso. Va como regex y no como z.iso.date() porque el schema lo ejecuta el
// consumidor con su propio Zod, y z.iso no existe antes de la version 4. Los segundos se toleran:
// un datetime-local los agrega si alguna vez se le baja el step.
export const DATE_VALUE_PATTERN: string = "^\\d{4}-\\d{2}-\\d{2}$";

export const DATETIME_VALUE_PATTERN: string = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?$";

export const DATE_VALUE_MESSAGE: string = "Fecha inválida";

export const DATETIME_VALUE_MESSAGE: string = "Fecha y hora inválidas";

export const RANGE_START_MISSING: string = "Falta la fecha inicial";

export const RANGE_START_INVALID: string = "Fecha inicial inválida";

export const RANGE_END_MISSING: string = "Falta la fecha final";

export const RANGE_END_INVALID: string = "Fecha final inválida";

export const RANGE_ORDER_MESSAGE: string = "La fecha final no puede ser anterior a la inicial";
