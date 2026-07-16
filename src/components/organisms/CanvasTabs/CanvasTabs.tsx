import { Plus } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import { DashedAddButton } from "../../molecules/DashedAddButton/DashedAddButton";
import { StepTabChip } from "../../molecules/StepTabChip/StepTabChip";

export function CanvasTabs() {
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const hasIntroModal = useFormStore((state) => state.setupConfig.hasIntroModal);
  const activeCanvas = useFormStore((state) => state.activeCanvas);
  const setActiveCanvas = useFormStore((state) => state.setActiveCanvas);
  const addFormStep = useFormStore((state) => state.addFormStep);
  const removeFormStep = useFormStore((state) => state.removeFormStep);
  const addIntroModalStep = useFormStore((state) => state.addIntroModalStep);
  const removeIntroModalStep = useFormStore((state) => state.removeIntroModalStep);

  return (
    <div className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-3 dark:border-neutral-800">
      <nav aria-label="Steps del formulario" className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-[10px] font-semibold uppercase text-slate-400 dark:text-neutral-500">
          Steps del formulario
        </span>
        <ul className="flex list-none flex-wrap items-center gap-1">
          {formSteps.map((step) => (
            <li key={step.stepId}>
              <StepTabChip
                label={step.title}
                active={activeCanvas.type === "formStep" && activeCanvas.stepId === step.stepId}
                onSelect={() => setActiveCanvas({ type: "formStep", stepId: step.stepId })}
                onRemove={formSteps.length > 1 ? () => removeFormStep(step.stepId) : undefined}
                removeTitle="Eliminar step"
                removeIconSize={12}
                className="pr-2.5"
              />
            </li>
          ))}
          <li>
            <DashedAddButton
              onClick={addFormStep}
              title="Agregar step al formulario"
              className="flex items-center border-slate-300 px-2.5 py-1.5 text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
            >
              <Plus size={12} weight="Filled" />
              Step
            </DashedAddButton>
          </li>
        </ul>
      </nav>

      {hasIntroModal && (
        <nav aria-label="Steps del modal de entrada" className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-[10px] font-semibold uppercase text-slate-400 dark:text-neutral-500">
            Modal de entrada
          </span>
          <ul className="flex list-none flex-wrap items-center gap-1">
            {introSteps.map((step) => (
              <li key={step.stepId}>
                <StepTabChip
                  label={step.title}
                  active={activeCanvas.type === "introStep" && activeCanvas.stepId === step.stepId}
                  onSelect={() => setActiveCanvas({ type: "introStep", stepId: step.stepId })}
                  onRemove={() => removeIntroModalStep(step.stepId)}
                  removeTitle="Eliminar paso"
                  removeIconSize={12}
                  className="pr-1"
                />
              </li>
            ))}
            <li>
              <DashedAddButton
                onClick={addIntroModalStep}
                title="Agregar paso al modal introductorio"
                className="flex items-center border-slate-300 px-2.5 py-1.5 text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
              >
                <Plus size={12} weight="Filled" /> Paso del modal
              </DashedAddButton>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
