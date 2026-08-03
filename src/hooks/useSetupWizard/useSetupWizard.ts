import { useState } from "react";
import { INDUSTRIA_COMERCIO_INTRO_STEPS } from "../../constants/baseTemplate";
import { useFormStore } from "../../store/formStore";
import type { FormType } from "../../types/setup";
import type { UseSetupWizardResult } from "./useSetupWizard.types";

// Asistente de dos pasos que se muestra mientras setupConfig.isComplete sea falso.
// Industria y comercio se salta la segunda pregunta: su plantilla ya trae modal de intro con un
// numero de pantallas fijo, asi que no tiene sentido preguntarlo.
export function useSetupWizard(): UseSetupWizardResult {
  const completeSetup = useFormStore((state) => state.completeSetup);
  const [step, setStep] = useState<1 | 2>(1);
  const [formType, setFormType] = useState<FormType | null>(null);
  const [hasIntroModal, setHasIntroModal] = useState<boolean | null>(null);
  const [introModalSteps, setIntroModalSteps] = useState<number>(1);

  const canProceed = formType !== null;
  const canFinish = hasIntroModal !== null;

  function goNext(): void {
    if (formType === "industria_comercio") {
      completeSetup({
        formType,
        hasIntroModal: true,
        introModalSteps: INDUSTRIA_COMERCIO_INTRO_STEPS,
      });
      return;
    }
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
