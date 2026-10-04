import type { CanvasField } from "../../../types/field";

export interface FieldRulesModalProps {
  field: CanvasField;
  candidates: CanvasField[];
  onClose: () => void;
}
