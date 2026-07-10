import type { FormStep, IntroModalState, SavedComponent, SetupConfig } from "./storeTypes";

export interface DraftPayload {
  formSteps: FormStep[];
  introModal: IntroModalState;
  savedComponents: SavedComponent[];
  setupConfig: SetupConfig;
  savedAt: string;
}
