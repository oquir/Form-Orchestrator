import type { ExportedRow } from "../../../../types/exportForm";
import type { FormPreviewApi } from "../../../../types/formPreview";
import type { RuntimeScope } from "../../../../types/formRuntime";

export interface PreviewRowsGridProps {
  rows: ExportedRow[];
  scope: RuntimeScope;
  preview: FormPreviewApi;
  groupId?: string;
  itemIndex?: number;
}
