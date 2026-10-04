import { datePattern, datePlaceholder } from "../../../lib/dateFormat/dateFormat";
import { dateFormatOf, includesTime, isDateRangeField } from "../../../lib/fieldDate/fieldDate";
import { allowsManualOptions } from "../../../lib/fieldOptions/fieldOptions";
import type { CanvasField, FieldOption } from "../../../types/field";
import type { DateFormatId } from "../../../types/fieldDate";
import { PLACEHOLDER_OPTIONS } from "./FieldPreviewControl.constants";
import type { PreviewOptions } from "./FieldPreviewControl.types";

// Sin formato el input es el del navegador, que en espanol se ve dd/mm/aaaa.
export function dateMockText(field: CanvasField): string {
  const withTime: boolean = includesTime(field);
  const format: DateFormatId = dateFormatOf(field) ?? "DD/MM/YYYY";
  const single: string = datePlaceholder(datePattern(format, withTime));

  return isDateRangeField(field) ? `${single} → ${single}` : single;
}

export function previewOptions(field: CanvasField): PreviewOptions {
  if (!allowsManualOptions(field)) {
    return { items: PLACEHOLDER_OPTIONS, isPlaceholder: true, note: "catalog" };
  }

  const options: FieldOption[] = field.options ?? [];

  return options.length === 0
    ? { items: PLACEHOLDER_OPTIONS, isPlaceholder: true, note: "empty" }
    : { items: options, isPlaceholder: false, note: null };
}
