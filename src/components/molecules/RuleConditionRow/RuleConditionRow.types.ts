import type { CanvasField, RuleCondition } from "../../../types/field";

export interface RuleConditionRowProps {
  condition: RuleCondition;
  candidates: CanvasField[];
  onFieldChange: (fieldId: string) => void;
  onUpdate: (updates: Partial<Omit<RuleCondition, "id">>) => void;
  onRemove: () => void;
}
