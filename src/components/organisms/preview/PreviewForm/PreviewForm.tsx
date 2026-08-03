import { useState } from "react";
import { stepErrorKeys } from "../../../../lib/formRuntime/formRuntime.utils";
import type { ExportedStep } from "../../../../types/exportForm";
import { PreviewStep } from "../PreviewStep/PreviewStep";
import { NAV_BUTTON_CLASSES, PRIMARY_BUTTON_CLASSES } from "./PreviewForm.constants";
import type { PreviewFormProps } from "./PreviewForm.types";

export function PreviewForm({ preview }: PreviewFormProps) {
  const [introOpen, setIntroOpen] = useState<boolean>(true);
  const [introIndex, setIntroIndex] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const steps: ExportedStep[] = preview.model.steps;
  const introSteps: ExportedStep[] = preview.model.introSteps;
  const showIntro: boolean = preview.model.hasIntroModal && introOpen;
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

  return (
    <div className="relative min-w-0 rounded-lg border border-border bg-surface p-6">
      {step ? <PreviewStep step={step} preview={preview} /> : <p>Sin pasos.</p>}

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => {
              setSubmitted(false);
              setStepIndex(current - 1);
            }}
            className={NAV_BUTTON_CLASSES}
          >
            Anterior
          </button>
          <span className="text-[11px] text-fg-subtle">
            Paso {current + 1} de {steps.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {submitted && (
            <span className="text-[11px] font-medium text-success">
              Formulario válido · el payload está listo
            </span>
          )}
          <button type="button" onClick={restart} className={NAV_BUTTON_CLASSES}>
            Reiniciar
          </button>
          <button type="button" onClick={advance} className={PRIMARY_BUTTON_CLASSES}>
            {isLastStep ? "Enviar" : "Siguiente"}
          </button>
        </div>
      </footer>

      {showIntro && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-slate-900/30 p-4 dark:bg-black/50">
          <div className="flex max-h-full w-full max-w-2xl flex-col overflow-auto rounded-xl border border-border bg-surface p-5 shadow-2xl">
            {introSteps[introIndex] && (
              <PreviewStep step={introSteps[introIndex]} preview={preview} />
            )}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-[11px] text-fg-subtle">
                Modal de entrada · {introIndex + 1} de {introSteps.length}
              </span>
              <button type="button" onClick={advanceIntro} className={PRIMARY_BUTTON_CLASSES}>
                {introIndex < introSteps.length - 1 ? "Continuar" : "Ir al formulario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
