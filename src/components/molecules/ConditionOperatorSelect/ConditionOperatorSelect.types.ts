import type { ConditionOperator } from "../../../types/field";

export interface ConditionOperatorSelectProps {
  operator: ConditionOperator;
  availableOperators: ConditionOperator[];
  operatorLabels: Record<ConditionOperator, string>;
  onChange: (operator: ConditionOperator) => void;
}
