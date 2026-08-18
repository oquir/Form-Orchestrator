import type { UseFieldRulesResult } from "../../../hooks/useFieldRules/useFieldRules.types";
import type { CanvasField, FieldRule } from "../../../types/field";

export interface FieldRuleCardProps {
  rule: FieldRule;
  index: number;
  rulesCount: number;
  rules: UseFieldRulesResult;
  candidates: CanvasField[];
  knownNames: Set<string>;
}
