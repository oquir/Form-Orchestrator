import { Plus } from "reicon-react";
import { getActiveRows, useFormStore } from "../../../store/formStore";
import { DashedAddButton } from "../../atoms/DashedAddButton/DashedAddButton";
import { StepTabChip } from "../../molecules/StepTabChip/StepTabChip";
import { ADD_BUTTON_CLASSES, GROUP_CAPTION_CLASSES } from "./CanvasTabs.constants";
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
    <div className="flex flex-col gap-3">
      <nav aria-label="Steps del formulario">
        {hasIntroModal && <span className={GROUP_CAPTION_CLASSES}>Formulario</span>}
        {/* Con todos los chips del mismo ancho entran 8 por fila, asi que el tope solo entra en
            juego pasados ~40 steps: el panel no rueda nunca, pero esta grilla si puede, y es el
            unico lugar de todo el panel donde eso pasa. */}
        <div className="max-h-56 overflow-y-auto">
          <ul className="flex list-none flex-wrap items-center gap-2">
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
                className={ADD_BUTTON_CLASSES}
              >
                <Plus size={14} weight="Filled" />
              </DashedAddButton>
            </li>
          </ul>
        </div>
      </nav>

      {hasIntroModal && (
        <nav aria-label="Steps del modal de entrada" className="border-t border-border pt-3">
          <span className={GROUP_CAPTION_CLASSES}>Modal de entrada</span>
          <ul className="flex list-none flex-wrap items-center gap-2">
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
                className={ADD_BUTTON_CLASSES}
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
