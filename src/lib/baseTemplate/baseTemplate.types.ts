import type { CatalogFill, ConditionOperator, FieldValidationRules } from "../../types/field";

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
  script: string;
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
  script?: string;
  alwaysDisabled?: boolean;
  visibleWhen?: TemplateCondition;
  enableWhen?: TemplateCondition;
  rules?: TemplateRule[];
  dataSource?: TemplateDataSource;
}

// Las tres reglas numericas de la plantilla, cada una con su alcance propio. El formato no lleva
// lista porque va en todos; las otras dos si, y por lados opuestos: el redondeo nombra a los que
// quedan afuera y el signo a los calculados que quedan adentro.
export interface NumericDefaults {
  roundingExceptions: string[];
  clampedCalculated: string[];
}

// Como FieldDataSource, pero apuntando a los campos por nombre: los uuid recien existen despues
// de buildRow, y resolveTemplateConditions los traduce.
export interface TemplateDataSource {
  catalog: string;
  dependsOn?: string;
  fills?: CatalogFill[];
}
