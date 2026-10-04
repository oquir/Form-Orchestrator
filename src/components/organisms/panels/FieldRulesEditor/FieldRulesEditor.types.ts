import type { CanvasField } from "../../../../types/field";

export interface FieldRulesEditorProps {
  field: CanvasField;
  candidates: CanvasField[];
}

export interface RuleEffectSummary {
  id: string;
  text: string;
  isCode: boolean;
}

export interface RuleSummary {
  id: string;
  // null sin nombre: el numero de la regla ya la identifica.
  label: string | null;
  when: string;
  effects: RuleEffectSummary[];
}
