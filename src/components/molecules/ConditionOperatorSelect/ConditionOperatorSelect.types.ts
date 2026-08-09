import type { ConditionOperator } from "../../../types/field";

export interface ConditionOperatorSelectProps {
  // Por defecto continua la frase que arma el editor de condiciones ("Cuando X …y el valor Y").
  // Donde el control va en una columna propia esa frase no se lee seguida y conviene rotularlo.
  label?: string;
  operator: ConditionOperator;
  availableOperators: ConditionOperator[];
  operatorLabels: Record<ConditionOperator, string>;
  onChange: (operator: ConditionOperator) => void;
}
