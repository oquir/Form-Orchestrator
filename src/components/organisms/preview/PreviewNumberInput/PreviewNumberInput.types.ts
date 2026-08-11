import type { ExportedField } from "../../../../types/exportForm";

export interface PreviewNumberInputProps {
  field: ExportedField;
  value: unknown;
  disabled: boolean;
  inputId: string;
  // Las clases las arma PreviewFieldControl, que ya sabe si el campo esta en rojo.
  className: string;
  onChange: (value: unknown) => void;
}
