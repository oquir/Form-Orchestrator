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
}

export interface FieldOption {
  id: string;
  label: string;
}

export interface FieldFileConfig {
  acceptedFormats: string[];
  maxSizeMB: number;
}

export type EnableOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "isEmpty"
  | "isNotEmpty"
  | "isTruthy"
  | "isFalsy";

export interface EnableCondition {
  fieldId: string;
  operator: EnableOperator;
  value?: string | number | boolean;
}

export type ApiBinding = { kind: "mapped"; path: string } | { kind: "excluded" };

export interface CanvasField {
  id: string;
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
  enableWhen?: EnableCondition;
  apiBinding?: ApiBinding;
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
  enableWhen?: EnableCondition;
  apiBinding?: ApiBinding;
}
