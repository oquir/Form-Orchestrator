import { useState } from "react";
import { useFormPreview } from "../../../hooks/useFormPreview/useFormPreview";
import type { ExportedStep } from "../../../types/exportForm";
import type { FormPreviewApi } from "../../../types/formPreview";
import { PreviewResults } from "../preview/PreviewResults/PreviewResults";
import { PreviewStep } from "../preview/PreviewStep/PreviewStep";
import { NAV_BUTTON_CLASSES, PRIMARY_BUTTON_CLASSES } from "./FormPreviewCanvas.constants";

export function FormPreviewCanvas() {
  const preview: FormPreviewApi = useFormPreview();
  const [introOpen, setIntroOpen] = useState<boolean>(true);
  const [introIndex, setIntroIndex] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const steps: ExportedStep[] = preview.model.steps;
  const introSteps: ExportedStep[] = preview.model.introSteps;
  const showIntro: boolean = preview.model.hasIntroModal && introOpen;
  // Si borran pasos en el lienzo el indice puede quedar mas alto que la lista.
  const current: number = Math.max(0, Math.min(stepIndex, steps.length - 1));
  const step: ExportedStep | undefined = steps[current];

  function closeIntro(): void {
    if (introIndex < introSteps.length - 1) {
      setIntroIndex(introIndex + 1);
      return;
    }
    setIntroOpen(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="relative min-w-0 rounded-lg border border-border bg-surface p-5">
        {step ? <PreviewStep step={step} preview={preview} /> : <p>Sin pasos.</p>}

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setStepIndex(current - 1)}
              className={NAV_BUTTON_CLASSES}
            >
              Anterior
            </button>
            <span className="text-[11px] text-fg-subtle">
              Paso {current + 1} de {steps.length}
            </span>
            <button
              type="button"
              disabled={current >= steps.length - 1}
              onClick={() => setStepIndex(current + 1)}
              className={NAV_BUTTON_CLASSES}
            >
              Siguiente
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                preview.reset();
                setStepIndex(0);
                setIntroIndex(0);
                setIntroOpen(true);
              }}
              className={NAV_BUTTON_CLASSES}
            >
              Reiniciar
            </button>
            <button type="button" onClick={preview.validateAll} className={PRIMARY_BUTTON_CLASSES}>
              Validar todo
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
                <button type="button" onClick={closeIntro} className={PRIMARY_BUTTON_CLASSES}>
                  {introIndex < introSteps.length - 1 ? "Continuar" : "Ir al formulario"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PreviewResults preview={preview} />
    </div>
  );
}
