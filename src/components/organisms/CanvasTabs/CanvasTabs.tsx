import { Plus } from "reicon-react";
import { getActiveRows, useFormStore } from "../../../store/formStore";
import { DashedAddButton } from "../../atoms/DashedAddButton/DashedAddButton";
import { StepTabChip } from "../../molecules/StepTabChip/StepTabChip";
import { resolveTransferState } from "./CanvasTabs.utils";

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
  const rowDrag = useFormStore((state) => state.rowDrag);
  const draggingFieldId = useFormStore((state) => state.draggingFieldId);
  const activeRows = useFormStore(getActiveRows);

  // Se resuelve una vez para todas las pestanas: la pregunta -que se arrastra y si puede salir de
  // su paso- no depende de cual sea el destino, solo de si el destino es el paso donde ya esta.
  const transferState = resolveTransferState(activeRows, rowDrag, draggingFieldId);

  return (
    <div className="flex flex-col gap-2">
      <nav aria-label="Steps del formulario">
        {/* El tope solo entra en juego pasados ~36 steps (chip de 28px, 6 por fila): el panel no
            rueda nunca, pero esta grilla si puede, y es el unico lugar de todo el panel donde
            eso pasa. */}
        <div className="max-h-56 overflow-y-auto">
          <ul className="flex list-none flex-wrap items-center gap-1.5">
            {formSteps.map((step, index) => {
              const isActive: boolean =
                activeCanvas.type === "formStep" && activeCanvas.stepId === step.stepId;

              return (
                <li key={step.stepId}>
                  <StepTabChip
                    index={index + 1}
                    label={step.title}
                    active={isActive}
                    canvasTarget={{ type: "formStep", stepId: step.stepId }}
                    // Soltar en el paso donde ya esta no es una mudanza, asi que ni se ofrece.
                    transferState={isActive ? "idle" : transferState}
                    onSelect={() => setActiveCanvas({ type: "formStep", stepId: step.stepId })}
                    onRemove={formSteps.length > 1 ? () => removeFormStep(step.stepId) : undefined}
                    removeTitle="Eliminar step"
                    removeIconSize={12}
                  />
                </li>
              );
            })}
            <li>
              <DashedAddButton
                onClick={addFormStep}
                title="Agregar step al formulario"
                aria-label="Agregar step al formulario"
                className="flex h-7 w-7 items-center justify-center rounded-md border-brand-border text-brand-fg hover:border-brand hover:text-brand-hover"
              >
                <Plus size={14} weight="Filled" />
              </DashedAddButton>
            </li>
          </ul>
        </div>
      </nav>

      {hasIntroModal && (
        <nav
          aria-label="Steps del modal de entrada"
          className="flex flex-wrap items-center gap-1.5 border-t border-slate-200 pt-2 dark:border-neutral-800"
        >
          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
            Modal
          </span>
          <ul className="flex list-none flex-wrap items-center gap-1.5">
            {introSteps.map((step, index) => {
              const isActive: boolean =
                activeCanvas.type === "introStep" && activeCanvas.stepId === step.stepId;

              return (
                <li key={step.stepId}>
                  <StepTabChip
                    index={index + 1}
                    label={step.title}
                    active={isActive}
                    canvasTarget={{ type: "introStep", stepId: step.stepId }}
                    transferState={isActive ? "idle" : transferState}
                    onSelect={() => setActiveCanvas({ type: "introStep", stepId: step.stepId })}
                    onRemove={() => removeIntroModalStep(step.stepId)}
                    removeTitle="Eliminar paso"
                    removeIconSize={12}
                  />
                </li>
              );
            })}
            <li>
              <DashedAddButton
                onClick={addIntroModalStep}
                title="Agregar paso al modal introductorio"
                aria-label="Agregar paso al modal introductorio"
                className="flex h-7 w-7 items-center justify-center rounded-md border-brand-border text-brand-fg hover:border-brand hover:text-brand-hover"
              >
                <Plus size={14} weight="Filled" />
              </DashedAddButton>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
