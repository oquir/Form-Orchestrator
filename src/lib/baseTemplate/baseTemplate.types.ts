import type { ConditionOperator, FieldValidationRules } from "../../types/field";

export interface TemplateCondition {
  field: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface TemplateValidationOverride {
  when: TemplateCondition;
  validations: FieldValidationRules;
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
  pattern?: string;
  // Solo se muestra cuando falla el patron: buildZodSchema lo cuelga del .regex().
  message?: string;
  validationOverrides?: TemplateValidationOverride[];
  formula?: string;
  alwaysDisabled?: boolean;
  visibleWhen?: TemplateCondition;
  enableWhen?: TemplateCondition;
  rules?: TemplateRule[];
  dataSource?: TemplateDataSource;
}

export interface TemplateDataSource {
  catalog: string;
  dependsOn?: string;
}
