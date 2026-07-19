import { Plus } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import { DashedAddButton } from "../../atoms/DashedAddButton/DashedAddButton";
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
    <div className="mb-4 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-neutral-800">
      <nav aria-label="Steps del formulario" className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
          Steps del formulario
        </span>
        <ul className="flex list-none flex-wrap items-center gap-2">
          {formSteps.map((step, index) => (
            <li key={step.stepId}>
              <StepTabChip
                index={index + 1}
                label={step.title}
                active={activeCanvas.type === "formStep" && activeCanvas.stepId === step.stepId}
                onSelect={() => setActiveCanvas({ type: "formStep", stepId: step.stepId })}
                onRemove={formSteps.length > 1 ? () => removeFormStep(step.stepId) : undefined}
                removeTitle="Eliminar step"
                removeIconSize={12}
              />
            </li>
          ))}
          <li>
            <DashedAddButton
              onClick={addFormStep}
              title="Agregar step al formulario"
              className="flex items-center gap-1 rounded-lg border-orange-300 px-3 py-1.5 text-orange-600 hover:border-orange-400 hover:text-orange-700 dark:border-orange-500/50 dark:text-orange-400 dark:hover:border-orange-400 dark:hover:text-orange-300"
            >
              <Plus size={12} weight="Filled" />
              Nuevo step
            </DashedAddButton>
          </li>
        </ul>
      </nav>

      {hasIntroModal && (
        <nav
          aria-label="Steps del modal de entrada"
          className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-neutral-800"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
            Modal de entrada
          </span>
          <ul className="flex list-none flex-wrap items-center gap-2">
            {introSteps.map((step, index) => (
              <li key={step.stepId}>
                <StepTabChip
                  index={index + 1}
                  label={step.title}
                  active={activeCanvas.type === "introStep" && activeCanvas.stepId === step.stepId}
                  onSelect={() => setActiveCanvas({ type: "introStep", stepId: step.stepId })}
                  onRemove={() => removeIntroModalStep(step.stepId)}
                  removeTitle="Eliminar paso"
                  removeIconSize={12}
                />
              </li>
            ))}
            <li>
              <DashedAddButton
                onClick={addIntroModalStep}
                title="Agregar paso al modal introductorio"
                className="flex items-center gap-1 rounded-lg border-orange-300 px-3 py-1.5 text-orange-600 hover:border-orange-400 hover:text-orange-700 dark:border-orange-500/50 dark:text-orange-400 dark:hover:border-orange-400 dark:hover:text-orange-300"
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
