import type { CanvasField } from "../../../types/field";

export interface LabelTargetSelectProps {
  value: string | undefined;
  candidates: CanvasField[];
  onChange: (targetFieldId: string | null) => void;
}
