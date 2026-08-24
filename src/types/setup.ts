export type FormType = "industria_comercio" | "retencion_industria_comercio" | "autorretencion";

export interface FormTypeOption {
  value: FormType;
  label: string;
  description: string;
}

export interface SetupConfig {
  isComplete: boolean;
  formType: FormType | null;
  hasIntroModal: boolean;
  introModalSteps: number;
}
