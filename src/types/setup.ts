export type FormType = "industria_comercio" | "retencion_industria_comercio" | "autorretencion";

export interface SetupConfig {
  isComplete: boolean;
  formType: FormType | null;
  hasIntroModal: boolean;
  introModalSteps: number;
}
