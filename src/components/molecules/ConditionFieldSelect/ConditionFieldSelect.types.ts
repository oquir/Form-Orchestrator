import type { CanvasField, EnableCondition } from "../../../types/storeTypes";

export interface ConditionFieldSelectProps {
  condition: EnableCondition;
  otherFields: CanvasField[];
  observedIsDead: boolean;
  onChange: (fieldId: string) => void;
}
