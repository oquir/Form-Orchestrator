import { useSetupWizard } from "../../../hooks/useSetupWizard/useSetupWizard";
import { Button } from "../../atoms/Button/Button";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import { WizardFooterActions } from "../../atoms/WizardFooterActions/WizardFooterActions";
import { BinaryChoiceToggle } from "../../molecules/BinaryChoiceToggle/BinaryChoiceToggle";
import { LabeledInput } from "../../molecules/LabeledInput/LabeledInput";
import { SelectableOptionCard } from "../../molecules/SelectableOptionCard/SelectableOptionCard";
import { FORM_TYPES } from "./SetupWizardModal.constants";
import type { SetupWizardModalProps } from "./SetupWizardModal.types";

export function SetupWizardModal({ draftWasInvalid = false }: SetupWizardModalProps) {
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
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-neutral-100">
        {step === 1 ? "Tipo de formulario" : "Modal de entrada"}
      </h2>

      {draftWasInvalid && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 dark:border-red-500/40 dark:bg-red-500/10">
          <p className="text-[11px] font-medium text-red-700 dark:text-red-400">
            El borrador guardado no tenía una estructura válida y se descartó.
          </p>
          <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
            Pasa cuando el almacenamiento del navegador se edita a mano o quedó de una versión
            anterior del builder. Se empieza de cero para no cargar un proyecto corrupto.
          </p>
        </div>
      )}

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
