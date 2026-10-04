import type { DateBoundUnit } from "../../types/fieldDate";

export const FIXED_DATE_PATTERN: RegExp = /^\d{4}-\d{2}-\d{2}$/;

export const UNIT_NAMES: Record<DateBoundUnit, [singular: string, plural: string]> = {
  days: ["día", "días"],
  months: ["mes", "meses"],
  years: ["año", "años"],
};
