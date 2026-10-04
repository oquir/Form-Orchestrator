import type { DateFormatId, DateFormatOption } from "../types/fieldDate";

// Los formatos que se le pueden pedir a un campo fecha. Es una lista cerrada y no un patron libre por
// la misma razon que el catalogo se elige de CATALOGS: un patron mal tecleado no falla, solo manda a
// la API una fecha que nadie va a entender.
export const DATE_FORMATS: DateFormatOption[] = [
  { id: "DD/MM/YYYY", label: "DD/MM/AAAA", example: "31/03/2025" },
  { id: "MM/DD/YYYY", label: "MM/DD/AAAA", example: "03/31/2025" },
  { id: "YYYY-MM-DD", label: "AAAA-MM-DD", example: "2025-03-31" },
  { id: "DD-MM-YYYY", label: "DD-MM-AAAA", example: "31-03-2025" },
  { id: "YYYY/MM/DD", label: "AAAA/MM/DD", example: "2025/03/31" },
  { id: "DD.MM.YYYY", label: "DD.MM.AAAA", example: "31.03.2025" },
  { id: "YYYYMMDD", label: "AAAAMMDD", example: "20250331" },
];

// Para z.enum, que pide una tupla no vacia. Sale de la lista de arriba para no escribir los ids dos
// veces: uno agregado alla y olvidado aca haria que el borrador lo descartara al recargar.
export const DATE_FORMAT_IDS = DATE_FORMATS.map((format) => format.id) as [
  DateFormatId,
  ...DateFormatId[],
];
