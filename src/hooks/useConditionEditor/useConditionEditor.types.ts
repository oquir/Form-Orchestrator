import type { CanvasField, EnableCondition, EnableOperator } from "../../types/storeTypes";

export interface UseConditionEditorParams {
  field: CanvasField;
  otherFields: CanvasField[];
}

export interface UseConditionEditorResult {
  condition: EnableCondition | undefined;
  observed: CanvasField | null;
  observedIsDead: boolean;
  availableOperators: EnableOperator[];
  needsValue: boolean;
  updateCondition: (next: Partial<EnableCondition>) => void;
  handleActivationChange: (checked: boolean) => void;
  handleObservedFieldChange: (nextFieldId: string) => void;
  handleOperatorChange: (nextOp: EnableOperator) => void;
}
