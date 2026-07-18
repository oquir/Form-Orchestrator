import type {
  EnableCondition,
  FieldFileConfig,
  FieldLogic,
  FieldOption,
  FieldStyles,
  FormType,
} from "../../types/storeTypes";

export interface ExportedField {
  fieldId: string;
  type: string;
  label: string;
  colSpan: number;
  styles: FieldStyles;
  validations: { zodSchema: string };
  logic: FieldLogic;
  title?: string;
  options?: FieldOption[];
  fileConfig?: FieldFileConfig;
  alwaysDisabled?: boolean;
  enableWhen?: EnableCondition;
}

export interface ExportedRow {
  rowId: string;
  columns: number;
  fields: ExportedField[];
}

export interface ExportedStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: ExportedRow[];
}

export interface ProjectMeta {
  formId: string;
  formType: FormType | null;
  version: string;
  createdAt: string;
}

export interface ExportedIntroModal {
  steps: ExportedStep[];
}

export interface ExportedSetupConfig {
  hasIntroModal: boolean;
  introModal?: ExportedIntroModal;
}

export interface ExportedFormSchema {
  gridBaseColumns: number;
  steps: ExportedStep[];
}

export interface FormExport {
  projectMeta: ProjectMeta;
  setupConfig: ExportedSetupConfig;
  formSchema: ExportedFormSchema;
}
