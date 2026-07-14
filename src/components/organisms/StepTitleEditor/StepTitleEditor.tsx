import { useFormStore } from "../../../store/formStore";
import { LabeledInput } from "../../molecules/LabeledInput/LabeledInput";

export function StepTitleEditor() {
  const activeCanvas = useFormStore((state) => state.activeCanvas);
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const updateFormStepTitle = useFormStore((state) => state.updateFormStepTitle);
  const updateFormStepSubtitle = useFormStore((state) => state.updateFormStepSubtitle);
  const updateIntroModalStepTitle = useFormStore((state) => state.updateIntroModalStepTitle);
  const updateIntroModalStepSubtitle = useFormStore((state) => state.updateIntroModalStepSubtitle);

  const step =
    activeCanvas.type === "formStep"
      ? formSteps.find((s) => s.stepId === activeCanvas.stepId)
      : introSteps.find((s) => s.stepId === activeCanvas.stepId);

  if (!step) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-3">
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
        className="max-w-sm"
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
        className="max-w-sm"
      />
    </div>
  );
}
