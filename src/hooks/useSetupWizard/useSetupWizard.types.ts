import type { FormType } from "../../types/setup";

// Lo que se elige en el primer paso: un tipo para empezar el proyecto, o abrir uno exportado.
export type WizardSelection = FormType | "import";

export type WizardStep = 1 | 2 | "import";

export interface UseSetupWizardResult {
  step: WizardStep;
  selection: WizardSelection | null;
  hasIntroModal: boolean | null;
  introModalSteps: number;
  canProceed: boolean;
  canFinish: boolean;
  setSelection: (selection: WizardSelection) => void;
  setHasIntroModal: (value: boolean) => void;
  setIntroModalSteps: (count: number) => void;
  goNext: () => void;
  goBack: () => void;
  handleFinish: () => void;
}
