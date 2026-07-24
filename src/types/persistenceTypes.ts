import type { SavedComponent } from "./field";
import type { FormStep, IntroModalState } from "./formStructure";
import type { SetupConfig } from "./setup";

export interface DraftPayload {
  formSteps: FormStep[];
  introModal: IntroModalState;
  savedComponents: SavedComponent[];
  setupConfig: SetupConfig;
  savedAt: string;
}
