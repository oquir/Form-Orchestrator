import type { CatalogBank } from "../../../../types/catalog";
import type { ExportedField, ExportedTooltip } from "../../../../types/exportForm";
import type { RuntimeScope } from "../../../../types/formRuntime";

export interface PreviewFieldProps {
  field: ExportedField;
  scope: RuntimeScope;
  catalogBank: CatalogBank;
  externalLabel: string | undefined;
  linkedTooltip: ExportedTooltip | undefined;
  error: string | undefined;
  onChange: (value: unknown) => void;
}
