import { useFormStore } from "../../../store/formStore";
import type { FormStep } from "../../../types/formStructure";
import { InfoHint } from "../../atoms/InfoHint/InfoHint";
import { ToggleSwitch } from "../../atoms/ToggleSwitch/ToggleSwitch";
import { LabeledInput } from "../../molecules/LabeledInput/LabeledInput";
import {
  HIDDEN_STEP_DESCRIPTION,
  HIDDEN_STEP_NOTE,
  OPTION_CONTROL_CLASSES,
  OPTION_ROW_CLASSES,
} from "./StepTitleEditor.constants";

export function StepTitleEditor() {
  const activeCanvas = useFormStore((state) => state.activeCanvas);
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const updateFormStepTitle = useFormStore((state) => state.updateFormStepTitle);
  const updateFormStepSubtitle = useFormStore((state) => state.updateFormStepSubtitle);
  const setFormStepHidden = useFormStore((state) => state.setFormStepHidden);
  const updateIntroModalStepTitle = useFormStore((state) => state.updateIntroModalStepTitle);
  const updateIntroModalStepSubtitle = useFormStore((state) => state.updateIntroModalStepSubtitle);

  const step =
    activeCanvas.type === "formStep"
      ? formSteps.find((s) => s.stepId === activeCanvas.stepId)
      : introSteps.find((s) => s.stepId === activeCanvas.stepId);

  // Solo un paso del formulario se puede ocultar: el modal de entrada no se navega igual.
  const formStep: FormStep | undefined =
    activeCanvas.type === "formStep"
      ? formSteps.find((s) => s.stepId === activeCanvas.stepId)
      : undefined;

  if (!step) return null;

  return (
    <div className="flex flex-col gap-3">
      <LabeledInput
        id="step-title"
        label="Título del step"
        required
        value={step.title}
        onChange={(event) =>
          activeCanvas.type === "formStep"
            ? updateFormStepTitle(step.stepId, event.target.value)
            : updateIntroModalStepTitle(step.stepId, event.target.value)
        }
        className="w-full"
      />
      <LabeledInput
        id="step-subtitle"
        label="Subtítulo del step (opcional)"
        value={step.subtitle ?? ""}
        onChange={(event) =>
          activeCanvas.type === "formStep"
            ? updateFormStepSubtitle(step.stepId, event.target.value)
            : updateIntroModalStepSubtitle(step.stepId, event.target.value)
        }
        className="w-full"
      />
      {formStep && (
        <div className="flex flex-col gap-1">
          <div className={OPTION_ROW_CLASSES}>
            <span className="text-sm text-fg">Ocultar este paso</span>
            <div className={OPTION_CONTROL_CLASSES}>
              <ToggleSwitch
                checked={Boolean(formStep.hidden)}
                onChange={(checked) => setFormStepHidden(formStep.stepId, checked)}
                label="Ocultar este paso"
              />
              <InfoHint text={HIDDEN_STEP_DESCRIPTION} label="Ayuda sobre Ocultar este paso" />
            </div>
          </div>
          {formStep.hidden && <p className="text-xs text-fg-subtle">{HIDDEN_STEP_NOTE}</p>}
        </div>
      )}
    </div>
  );
}
