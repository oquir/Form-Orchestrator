import { datePattern, datePlaceholder } from "../../../lib/dateFormat/dateFormat";
import { dateFormatOf, includesTime, isDateRangeField } from "../../../lib/fieldDate/fieldDate";
import type { CanvasField } from "../../../types/field";
import type { DateFormatId } from "../../../types/fieldDate";

// Sin formato el input es el del navegador, que en espanol se ve dd/mm/aaaa.
export function dateMockText(field: CanvasField): string {
  const withTime: boolean = includesTime(field);
  const format: DateFormatId = dateFormatOf(field) ?? "DD/MM/YYYY";
  const single: string = datePlaceholder(datePattern(format, withTime));

  return isDateRangeField(field) ? `${single} → ${single}` : single;
}
