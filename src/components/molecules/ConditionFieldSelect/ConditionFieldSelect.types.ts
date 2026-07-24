import type { CanvasField, EnableCondition } from "../../../types/field";

export interface ConditionFieldSelectProps {
  condition: EnableCondition;
  otherFields: CanvasField[];
  observedIsDead: boolean;
  onChange: (fieldId: string) => void;
}
