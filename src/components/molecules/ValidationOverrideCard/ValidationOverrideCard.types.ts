import type { CanvasField, FieldValidationOverride } from "../../../types/field";

export interface ValidationOverrideCardProps {
  field: CanvasField;
  override: FieldValidationOverride;
  candidates: CanvasField[];
  position: number;
}
