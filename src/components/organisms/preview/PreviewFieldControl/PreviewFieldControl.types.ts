import type { ExportedField } from "../../../../types/exportForm";

export interface PreviewFieldControlProps {
  field: ExportedField;
  value: unknown;
  disabled: boolean;
  invalid: boolean;
  onChange: (value: unknown) => void;
}
