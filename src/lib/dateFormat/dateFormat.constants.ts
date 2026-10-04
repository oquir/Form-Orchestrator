// Los tokens de un patron de fecha. El orden importa: YYYY va antes que cualquier par para que nunca
// se lea como dos tokens, y mm (minutos) se distingue de MM (mes) por las minusculas.
export const TOKEN_PATTERN: RegExp = /YYYY|DD|MM|HH|mm/g;

export const TIME_SUFFIX: string = " HH:mm";

// El valor interno: el que entrega un input date o datetime-local. Los segundos se toleran y se
// descartan al formatear.
export const ISO_DATE: RegExp = /^(\d{4})-(\d{2})-(\d{2})$/;

export const ISO_DATETIME: RegExp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/;

// Los tokens en espanol, para el texto de ayuda dentro del input vacio.
export const PLACEHOLDER_TOKENS: Record<string, string> = {
  YYYY: "aaaa",
  MM: "mm",
  DD: "dd",
  HH: "hh",
  mm: "mm",
};
