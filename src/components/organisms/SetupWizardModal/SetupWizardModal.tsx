import { useSetupWizard } from "../../../hooks/useSetupWizard/useSetupWizard";
import { Button } from "../../atoms/Button/Button";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import { WizardFooterActions } from "../../atoms/WizardFooterActions/WizardFooterActions";
import { BinaryChoiceToggle } from "../../molecules/BinaryChoiceToggle/BinaryChoiceToggle";
import { LabeledInput } from "../../molecules/LabeledInput/LabeledInput";
import { SelectableOptionCard } from "../../molecules/SelectableOptionCard/SelectableOptionCard";
import { FORM_TYPES } from "./SetupWizardModal.constants";

export function SetupWizardModal() {
  const {
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
  } = useSetupWizard();

  return (
    <ModalShell maxWidthClassName="max-w-lg">
      <p className="mb-1 text-xs font-medium text-slate-400 dark:text-neutral-500">
        Paso {step} de 2
      </p>
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-neutral-100">
        {step === 1 ? "Tipo de formulario" : "Modal de entrada"}
      </h2>

      {step === 1 && (
        <div className="flex flex-col gap-2">
          {FORM_TYPES.map((option) => (
            <SelectableOptionCard
              key={option.value}
              label={option.label}
              description={option.description}
              selected={formType === option.value}
              onClick={() => setFormType(option.value)}
            />
          ))}

          <WizardFooterActions justify="end">
            <Button
              variant="primary"
              disabled={!canProceed}
              onClick={goNext}
              className="mt-4 px-4 py-1.5 text-sm hover:cursor-pointer"
            >
              Siguiente
            </Button>
          </WizardFooterActions>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-neutral-300">
            ¿El formulario compilado requerirá un modal introductorio para el usuario final?
          </p>
          <BinaryChoiceToggle value={hasIntroModal} onChange={setHasIntroModal} />

          {hasIntroModal && (
            <LabeledInput
              id="intro-modal-steps"
              label="Cantidad de pasos del modal"
              type="number"
              min={1}
              value={introModalSteps}
              onChange={(event) => setIntroModalSteps(Number(event.target.value))}
            />
          )}

          <WizardFooterActions justify="between" className="mt-2">
            <Button
              variant="ghost"
              onClick={goBack}
              className="px-4 py-1.5 text-sm hover:cursor-pointer"
            >
              Atrás
            </Button>
            <Button
              variant="primary"
              disabled={!canFinish}
              onClick={handleFinish}
              className="px-4 py-1.5 text-sm hover:cursor-pointer"
            >
              Crear proyecto
            </Button>
          </WizardFooterActions>
        </div>
      )}
    </ModalShell>
  );
}
