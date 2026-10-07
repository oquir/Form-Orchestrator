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
  // El campo al que rotula, por nombre: resolveTemplateConditions lo traduce a id como todo lo
  // demas. Solo tiene sentido en un campo de tipo label.
  labelFor?: string;
  inlineOptions?: boolean;
}

// Las reglas numericas de la plantilla, cada una con su alcance propio. El formato no lleva
// lista porque va en todos; el redondeo y el signo si, y por lados opuestos: el redondeo nombra a
// los que quedan afuera y el signo a los calculados que quedan adentro. El prefijo de plata reusa
// la lista del redondeo, que es justamente la de los que no llevan plata.
export interface NumericDefaults {
  roundingExceptions: string[];
  clampedCalculated: string[];
  decimals: number;
  decimalsByField: Record<string, number>;
  moneyPrefix: string;
  suffixByField: Record<string, string>;
}

// Como FieldDataSource, pero apuntando a los campos por nombre: los uuid recien existen despues
// de buildRow, y resolveTemplateConditions los traduce.
export interface TemplateDataSource {
  catalog: string;
  dependsOn?: string;
  fills?: CatalogFill[];
}
