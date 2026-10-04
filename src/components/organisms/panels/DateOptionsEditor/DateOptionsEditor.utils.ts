import { datePattern, formatIsoValue } from "../../../../lib/dateFormat/dateFormat";
import { dateFormatOf, includesTime } from "../../../../lib/fieldDate/fieldDate";
import type { CanvasField } from "../../../../types/field";
import type { DateFormatId } from "../../../../types/fieldDate";
import { SAMPLE_DATE, SAMPLE_DATETIME } from "./DateOptionsEditor.constants";

export function formatExample(field: CanvasField): string {
  const withTime: boolean = includesTime(field);
  const sample: string = withTime ? SAMPLE_DATETIME : SAMPLE_DATE;
  const format: DateFormatId | undefined = dateFormatOf(field);

  if (format === undefined) {
    return `El navegador la muestra en su idioma. A la API viaja como ${sample}.`;
  }

  const formatted: string =
    formatIsoValue(sample, datePattern(format, withTime), withTime) ?? sample;

  return `Se ve y viaja a la API como ${formatted}.`;
}
