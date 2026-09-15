import { useState } from "react";
import { INDUSTRIA_COMERCIO_INTRO_STEPS } from "../../constants/baseTemplate";
import { useFormStore } from "../../store/formStore";
import type { UseSetupWizardResult, WizardSelection, WizardStep } from "./useSetupWizard.types";

// Asistente de dos pasos que se muestra mientras setupConfig.isComplete sea falso.
// Industria y comercio se salta la segunda pregunta: su plantilla ya trae modal de intro con un
// numero de pantallas fijo, asi que no tiene sentido preguntarlo. Abrir un formulario exportado va
// por su propia pantalla y no crea nada: el proyecto entero sale del archivo (useProjectImport).
export function useSetupWizard(): UseSetupWizardResult {
  const completeSetup = useFormStore((state) => state.completeSetup);
  const [step, setStep] = useState<WizardStep>(1);
  const [selection, setSelection] = useState<WizardSelection | null>(null);
  const [hasIntroModal, setHasIntroModal] = useState<boolean | null>(null);
  const [introModalSteps, setIntroModalSteps] = useState<number>(1);

  const canProceed = selection !== null;
  const canFinish = hasIntroModal !== null;

  function goNext(): void {
    if (selection === "import") {
      setStep("import");
      return;
    }

    if (selection === "industria_comercio") {
      completeSetup({
        formType: selection,
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
    if (selection === null || selection === "import" || hasIntroModal === null) return;
    completeSetup({
      formType: selection,
      hasIntroModal,
      introModalSteps: hasIntroModal ? introModalSteps : 0,
    });
  }

  return {
    step,
    selection,
    hasIntroModal,
    introModalSteps,
    canProceed,
    canFinish,
    setSelection,
    setHasIntroModal,
    setIntroModalSteps,
    goNext,
    goBack,
    handleFinish,
  };
}
