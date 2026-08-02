import type { ExportedField } from "../../../../types/exportForm";
import type { FieldTooltip } from "../../../../types/field";
import type { RuntimeScope } from "../../../../types/formRuntime";

export interface PreviewFieldProps {
  field: ExportedField;
  scope: RuntimeScope;
  externalLabel: string | undefined;
  linkedTooltip: FieldTooltip | undefined;
  error: string | undefined;
  onChange: (value: unknown) => void;
}
