import type { EnableOperator } from "../../../types/field";

export interface ConditionOperatorSelectProps {
  operator: EnableOperator;
  availableOperators: EnableOperator[];
  operatorLabels: Record<EnableOperator, string>;
  onChange: (operator: EnableOperator) => void;
}
