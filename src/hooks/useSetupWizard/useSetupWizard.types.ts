import type { FormType } from "../../types/storeTypes";

export interface UseSetupWizardResult {
  step: 1 | 2;
  formType: FormType | null;
  hasIntroModal: boolean | null;
  introModalSteps: number;
  canProceed: boolean;
  canFinish: boolean;
  setFormType: (type: FormType) => void;
  setHasIntroModal: (value: boolean) => void;
  setIntroModalSteps: (count: number) => void;
  goNext: () => void;
  goBack: () => void;
  handleFinish: () => void;
}
