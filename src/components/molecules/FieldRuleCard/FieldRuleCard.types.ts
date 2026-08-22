import type { CanvasField, FieldRule } from "../../../types/field";
import type { UseFieldRulesResult } from "../../../types/fieldRulesReturn";

export interface FieldRuleCardProps {
  rule: FieldRule;
  index: number;
  rulesCount: number;
  rules: UseFieldRulesResult;
  candidates: CanvasField[];
  knownNames: Set<string>;
}
