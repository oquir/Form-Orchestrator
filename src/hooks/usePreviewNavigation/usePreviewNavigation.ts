import { useState } from "react";
import { stepErrorKeys } from "../../lib/formRuntime/formRuntime.utils";
import type { ExportedStep } from "../../types/exportForm";
import type { FormPreviewApi } from "../../types/formPreview";
import type { UsePreviewNavigationResult } from "./usePreviewNavigation.types";

// El recorrido del simulador: en que paso esta, si el modal de entrada sigue arriba y si el
// formulario ya se envio. No valida nada por su cuenta — le pide a useFormPreview que revele los
// errores del paso y solo avanza si quedo limpio, que es la regla de que la validacion es por
// pantalla y bloquea la navegacion.
export function usePreviewNavigation(preview: FormPreviewApi): UsePreviewNavigationResult {
  const [introOpen, setIntroOpen] = useState<boolean>(true);
  const [introIndex, setIntroIndex] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const steps: ExportedStep[] = preview.model.steps;
  const introSteps: ExportedStep[] = preview.model.introSteps;
  // Si borran pasos en el lienzo el indice puede quedar mas alto que la lista.
  const current: number = Math.max(0, Math.min(stepIndex, steps.length - 1));
  const step: ExportedStep | undefined = steps[current];
  const isLastStep: boolean = current >= steps.length - 1;

  function advance(): void {
    if (!step) return;
    setSubmitted(false);
    if (!preview.validateKeys(stepErrorKeys(step, preview.snapshot))) return;

    if (isLastStep) {
      setSubmitted(true);
      return;
    }

    setStepIndex(current + 1);
  }

  function goBack(): void {
    setSubmitted(false);
    setStepIndex(current - 1);
  }

  function advanceIntro(): void {
    const introStep: ExportedStep | undefined = introSteps[introIndex];
    if (introStep && !preview.validateKeys(stepErrorKeys(introStep, preview.snapshot))) return;

    if (introIndex < introSteps.length - 1) {
      setIntroIndex(introIndex + 1);
      return;
    }

    setIntroOpen(false);
  }

  function restart(): void {
    preview.reset();
    setStepIndex(0);
    setIntroIndex(0);
    setIntroOpen(true);
    setSubmitted(false);
  }

  return {
    step,
    stepNumber: current + 1,
    stepCount: steps.length,
    isFirstStep: current === 0,
    isLastStep,
    submitted,
    showIntro: preview.model.hasIntroModal && introOpen,
    introStep: introSteps[introIndex],
    introNumber: introIndex + 1,
    introCount: introSteps.length,
    isLastIntroStep: introIndex >= introSteps.length - 1,
    advance,
    goBack,
    advanceIntro,
    restart,
  };
}
