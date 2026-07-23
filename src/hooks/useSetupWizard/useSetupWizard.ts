import { useState } from "react";
import { useFormStore } from "../../store/formStore";
import type { FormType } from "../../types/storeTypes";
import type { UseSetupWizardResult } from "./useSetupWizard.types";

export function useSetupWizard(): UseSetupWizardResult {
  const completeSetup = useFormStore((state) => state.completeSetup);
  const [step, setStep] = useState<1 | 2>(1);
  const [formType, setFormType] = useState<FormType | null>(null);
  const [hasIntroModal, setHasIntroModal] = useState<boolean | null>(null);
  const [introModalSteps, setIntroModalSteps] = useState<number>(1);

  const canProceed = formType !== null;
  const canFinish = hasIntroModal !== null;

  function goNext(): void {
    setStep(2);
  }

  function goBack(): void {
    setStep(1);
  }

  function handleFinish(): void {
    if (!formType || hasIntroModal === null) return;
    completeSetup({
      formType,
      hasIntroModal,
      introModalSteps: hasIntroModal ? introModalSteps : 0,
    });
  }

  return {
    step,
    formType,
    hasIntroModal,
    introModalSteps,
    canProceed,
    canFinish,
    setFormType,
    setHasIntroModal,
    setIntroModalSteps,
    goNext,
    goBack,
    handleFinish,
  };
}
