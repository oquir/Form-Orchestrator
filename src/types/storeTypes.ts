export type FormType = "industria_comercio" | "retencion_industria_comercio" | "autorretencion";

export interface SetupConfig {
  isComplete: boolean;
  formType: FormType | null;
  hasIntroModal: boolean;
  introModalSteps: number;
}

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

export interface CanvasField {
  id: string;
  type: string;
  label: string;
  colSpan: number;
  validations: FieldValidations;
  styles: FieldStyles;
  logic: FieldLogic;
  title?: string;
  options?: FieldOption[];
  fileConfig?: FieldFileConfig;
}

export interface CanvasRow {
  id: string;
  columns: number;
  fields: CanvasField[];
}

export interface FormStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: CanvasRow[];
}

export interface IntroModalStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: CanvasRow[];
}

export interface IntroModalState {
  steps: IntroModalStep[];
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
}

export type CanvasTarget =
  | { type: "formStep"; stepId: string }
  | { type: "introStep"; stepId: string };

export type SidebarTab = "fields" | "attributes" | "validations" | "styles" | "logic" | "library";

export interface StateSlice {
  formSteps: FormStep[];
  introModal: IntroModalState;
}
