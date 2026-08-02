import type { ExportedRow } from "../../../../types/exportForm";
import type { FormPreviewApi } from "../../../../types/formPreview";

export interface PreviewGroupBandProps {
  groupId: string;
  rows: ExportedRow[];
  preview: FormPreviewApi;
}
