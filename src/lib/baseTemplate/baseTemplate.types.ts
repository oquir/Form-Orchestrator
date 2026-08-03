import type { ConditionOperator } from "../../types/field";

export interface TemplateCondition {
  field: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface TemplateRule {
  label?: string;
  when: TemplateCondition[];
  formula: string;
}

export interface FieldSpec {
  name: string;
  type: string;
  label: string;
  colSpan: number;
  path?: string;
  excluded?: boolean;
  required?: boolean;
  min?: number;
  formula?: string;
  alwaysDisabled?: boolean;
  visibleWhen?: TemplateCondition;
  rules?: TemplateRule[];
}
