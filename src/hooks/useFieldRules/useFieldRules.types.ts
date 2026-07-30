import type { CanvasField, FieldRule, RuleCondition, RuleEffect } from "../../types/field";

export interface UseFieldRulesParams {
  field: CanvasField;
  candidates: CanvasField[];
}

export interface UseFieldRulesResult {
  rules: FieldRule[];
  formula: string;
  canAddRule: boolean;
  setFormula: (formula: string) => void;
  addRule: () => void;
  removeRule: (ruleId: string) => void;
  moveRule: (ruleId: string, offset: number) => void;
  setRuleLabel: (ruleId: string, label: string) => void;
  setRuleMatchAll: (ruleId: string, matchAll: boolean) => void;
  addCondition: (ruleId: string) => void;
  updateCondition: (
    ruleId: string,
    conditionId: string,
    updates: Partial<Omit<RuleCondition, "id">>,
  ) => void;
  setConditionField: (ruleId: string, conditionId: string, fieldId: string) => void;
  removeCondition: (ruleId: string, conditionId: string) => void;
  addEffect: (ruleId: string, effect: RuleEffect) => void;
  updateEffect: (ruleId: string, effectId: string, effect: RuleEffect) => void;
  removeEffect: (ruleId: string, effectId: string) => void;
}
