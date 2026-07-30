import type { CanvasField, FieldCondition } from "../../../types/field";

export interface ConditionFieldSelectProps {
  label: string;
  condition: FieldCondition;
  otherFields: CanvasField[];
  observedIsDead: boolean;
  onChange: (fieldId: string) => void;
}
