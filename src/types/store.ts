import type { FormStep, IntroModalState } from "./formStructure";

export interface StateSlice {
  formSteps: FormStep[];
  introModal: IntroModalState;
}
