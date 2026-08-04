import type { RichTextContent } from "./richText";

export interface FieldValidations {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface FieldStyles {
  customClasses?: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface FieldLogic {
  dependencies: string[];
  typeScript: string;
  formula?: string;
  rules?: FieldRule[];
}

export interface FieldOption {
  id: string;
  label: string;
}

export interface FieldFileConfig {
  acceptedFormats: string[];
  maxSizeMB: number;
}

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface FieldTooltip {
  content: RichTextContent;
  position: TooltipPosition;
  customClasses?: string;
}

export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "startsWith"
  | "endsWith"
  | "contains"
  | "matches"
  | "in"
  | "isEmpty"
  | "isNotEmpty"
  | "isTruthy"
  | "isFalsy";

export type ConditionKind = "enable" | "visible";

export interface FieldCondition {
  fieldId: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface RuleCondition extends FieldCondition {
  id: string;
}

export type RuleEffect =
  | { id: string; kind: "formula"; expression: string }
  | { id: string; kind: "constant"; value: string | number | boolean };

export interface FieldRule {
  id: string;
  label?: string;
  matchAll: boolean;
  when: RuleCondition[];
  effects: RuleEffect[];
}

export type ApiBinding = { kind: "mapped"; path: string } | { kind: "excluded" };

// Que catalogo alimenta las opciones del campo. `dependsOn` guarda el id del campo que
// parametriza la consulta (departamento -> municipios) y se resuelve a nombre al exportar.
export interface FieldDataSource {
  catalog: string;
  dependsOn?: string;
}

export interface CanvasField {
  id: string;
  name: string;
  type: string;
  label: string;
  colStart: number;
  colSpan: number;
  validations: FieldValidations;
  styles: FieldStyles;
  logic: FieldLogic;
  title?: string;
  options?: FieldOption[];
  fileConfig?: FieldFileConfig;
  alwaysDisabled?: boolean;
  enableWhen?: FieldCondition;
  visibleWhen?: FieldCondition;
  apiBinding?: ApiBinding;
  dataSource?: FieldDataSource;
  labelFor?: string;
  content?: RichTextContent;
  tooltip?: FieldTooltip;
}

export interface SavedComponent {
  id: string;
  name: string;
  type: string;
  label: string;
  colSpan: number;
  validations: FieldValidations;
  styles: FieldStyles;
  logic: FieldLogic;
  title?: string;
  options?: FieldOption[];
  fileConfig?: FieldFileConfig;
  alwaysDisabled?: boolean;
  enableWhen?: FieldCondition;
  visibleWhen?: FieldCondition;
  apiBinding?: ApiBinding;
  dataSource?: FieldDataSource;
  tooltip?: FieldTooltip;
}
