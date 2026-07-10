import { useState } from "react";
import { useFormStore } from "../../../store/formStore";
import type { FormType } from "../../../types/storeTypes";
import { Button } from "../../atoms/Button/Button";
import { BinaryChoiceToggle } from "../../molecules/BinaryChoiceToggle/BinaryChoiceToggle";
import { LabeledInput } from "../../molecules/LabeledInput/LabeledInput";
import { ModalShell } from "../../molecules/ModalShell/ModalShell";
import { SelectableOptionCard } from "../../molecules/SelectableOptionCard/SelectableOptionCard";
import { WizardFooterActions } from "../../molecules/WizardFooterActions/WizardFooterActions";

const FORM_TYPES: { value: FormType; label: string; description: string }[] = [
  {
    value: "industria_comercio",
    label: "Industria y Comercio",
    description: "Carga una plantilla base preexistente para empezar más rápido.",
  },
  {
    value: "retencion_industria_comercio",
    label: "Retención de Industria y Comercio",
    description: "Empieza desde un lienzo en blanco.",
  },
  {
    value: "autorretencion",
    label: "Autorretención",
    description: "Empieza desde un lienzo en blanco.",
  },
];

export function SetupWizardModal() {
  const completeSetup = useFormStore((state) => state.completeSetup);
  const [step, setStep] = useState<1 | 2>(1);
  const [formType, setFormType] = useState<FormType | null>(null);
  const [hasIntroModal, setHasIntroModal] = useState<boolean | null>(null);
  const [introModalSteps, setIntroModalSteps] = useState(1);

  function handleFinish() {
    if (!formType || hasIntroModal === null) return;
    completeSetup({
      formType,
      hasIntroModal,
      introModalSteps: hasIntroModal ? introModalSteps : 0,
    });
  }

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
              disabled={!formType}
              onClick={() => setStep(2)}
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
              onClick={() => setStep(1)}
              className="px-4 py-1.5 text-sm hover:cursor-pointer"
            >
              Atrás
            </Button>
            <Button
              variant="primary"
              disabled={hasIntroModal === null}
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
