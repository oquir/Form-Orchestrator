import type { CatalogBank } from "../../../../types/catalog";
import type { ExportedField } from "../../../../types/exportForm";
import type { RuntimeValues } from "../../../../types/formRuntime";

export interface PreviewFieldControlProps {
  field: ExportedField;
  value: unknown;
  disabled: boolean;
  invalid: boolean;
  // Un catalogo con dependsOn se consulta con el valor del campo padre.
  scopeValues: RuntimeValues;
  catalogBank: CatalogBank;
  onChange: (value: unknown) => void;
}
