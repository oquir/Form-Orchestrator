import type { DateFormatId } from "../../../../types/fieldDate";

export interface PreviewDateRangeInputProps {
  label: string;
  value: unknown;
  disabled: boolean;
  inputId: string;
  format: DateFormatId | undefined;
  withTime: boolean;
  max: string;
  // Las clases las arma PreviewFieldControl, que ya sabe si el campo esta en rojo.
  className: string;
  onChange: (value: unknown) => void;
}
