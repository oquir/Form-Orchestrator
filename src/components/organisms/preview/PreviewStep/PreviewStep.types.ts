import type { ExportedRow, ExportedStep } from "../../../../types/exportForm";
import type { FormPreviewApi } from "../../../../types/formPreview";

export interface PreviewStepProps {
  step: ExportedStep;
  preview: FormPreviewApi;
}

export type PreviewBlock =
  | { kind: "rows"; rows: ExportedRow[] }
  | { kind: "group"; groupId: string; rows: ExportedRow[] };
