import type { CanvasField, FieldCondition } from "../../../types/field";

export interface ConditionFieldSelectProps {
  condition: FieldCondition;
  otherFields: CanvasField[];
  observedIsDead: boolean;
  onChange: (fieldId: string) => void;
}
