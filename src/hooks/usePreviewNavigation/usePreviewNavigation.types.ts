import type { ExportedStep } from "../../types/exportForm";

export interface UsePreviewNavigationResult {
  step: ExportedStep | undefined;
  stepNumber: number;
  stepCount: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitted: boolean;
  showIntro: boolean;
  introStep: ExportedStep | undefined;
  introNumber: number;
  introCount: number;
  isLastIntroStep: boolean;
  advance: () => void;
  goBack: () => void;
  advanceIntro: () => void;
  restart: () => void;
}
