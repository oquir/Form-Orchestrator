import type { CanvasField, EnableCondition } from "../../../types/storeTypes";

export interface ConditionValueInputProps {
  condition: EnableCondition;
  observedField: CanvasField | null | undefined;
  onChange: (value: EnableCondition["value"]) => void;
}
