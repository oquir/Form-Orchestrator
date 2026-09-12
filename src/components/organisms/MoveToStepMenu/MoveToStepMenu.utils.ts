import type { FormStep, IntroModalStep } from "../../../types/formStructure";
import type { CanvasTarget } from "../../../types/placement";
import type { MoveTargetOption, MoveTargetSection } from "./MoveToStepMenu.types";

// Los pasos a los que se puede mudar la seleccion, agrupados como en el panel de Steps. El activo no
// se ofrece: mudarse al paso donde ya se esta no es una mudanza.
export function buildMoveSections(
  formSteps: FormStep[],
  introSteps: IntroModalStep[],
  active: CanvasTarget,
): MoveTargetSection[] {
  const form: MoveTargetOption[] = toOptions("formStep", formSteps, active);
  const intro: MoveTargetOption[] = toOptions("introStep", introSteps, active);
  const sections: MoveTargetSection[] = [];

  // Igual que en CanvasTabs: sin modal de entrada, un titulo "Formulario" solo repetiria lo obvio.
  if (form.length > 0) {
    sections.push({
      key: "formStep",
      caption: introSteps.length > 0 ? "Formulario" : null,
      options: form,
    });
  }

  if (intro.length > 0) {
    sections.push({ key: "introStep", caption: "Modal de entrada", options: intro });
  }

  return sections;
}

function toOptions(
  type: CanvasTarget["type"],
  steps: { stepId: string; title: string }[],
  active: CanvasTarget,
): MoveTargetOption[] {
  return steps
    .map((step, index) => ({
      target: toTarget(type, step.stepId),
      number: index + 1,
      title: step.title.trim() || `Paso ${index + 1}`,
    }))
    .filter(
      (option) => option.target.type !== active.type || option.target.stepId !== active.stepId,
    );
}

function toTarget(type: CanvasTarget["type"], stepId: string): CanvasTarget {
  return type === "formStep" ? { type: "formStep", stepId } : { type: "introStep", stepId };
}
