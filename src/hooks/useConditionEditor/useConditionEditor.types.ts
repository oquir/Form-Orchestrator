import type { CanvasField, ConditionOperator, FieldCondition } from "../../types/field";

export type ConditionKind = "enable" | "visible";

export interface UseConditionEditorParams {
  field: CanvasField;
  otherFields: CanvasField[];
  kind: ConditionKind;
}

export interface UseConditionEditorResult {
  condition: FieldCondition | undefined;
  observed: CanvasField | null;
  observedIsDead: boolean;
  availableOperators: ConditionOperator[];
  needsValue: boolean;
  updateCondition: (next: Partial<FieldCondition>) => void;
  handleActivationChange: (checked: boolean) => void;
  handleObservedFieldChange: (nextFieldId: string) => void;
  handleOperatorChange: (nextOp: ConditionOperator) => void;
}
