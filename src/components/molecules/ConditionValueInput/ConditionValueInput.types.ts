import type { CanvasField, EnableCondition } from "../../../types/field";

export interface ConditionValueInputProps {
  condition: EnableCondition;
  observedField: CanvasField | null | undefined;
  onChange: (value: EnableCondition["value"]) => void;
}
