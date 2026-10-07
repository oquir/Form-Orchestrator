import type { FormStep, IntroModalStep } from "../../types/formStructure";
import type { CanvasTarget } from "../../types/placement";

// Moverse de a un paso con el teclado (Ctrl + flechas). Solo de a uno y sin dar la vuelta: llegar
// a un paso lejano es recorrer los de en medio, a proposito -- no hay salto directo a un paso, ni
// al primero ni al ultimo.

// Los pasos en el orden en que los recorre el contribuyente: primero los del modal de entrada y
// despues los del formulario. El panel los muestra al reves -- el formulario arriba, que es donde
// se trabaja --, pero la flecha sigue el recorrido real del formulario, no la disposicion.
export function orderedSteps(formSteps: FormStep[], introSteps: IntroModalStep[]): CanvasTarget[] {
  return [
    ...introSteps.map((step): CanvasTarget => ({ type: "introStep", stepId: step.stepId })),
    ...formSteps.map((step): CanvasTarget => ({ type: "formStep", stepId: step.stepId })),
  ];
}

// null en los extremos, y tambien si el paso activo ya no esta en la lista: ahi no hay un "al lado"
// que tenga sentido, y elegir uno a ciegas seria peor que no moverse.
export function adjacentStep(
  steps: CanvasTarget[],
  current: CanvasTarget,
  offset: 1 | -1,
): CanvasTarget | null {
  const index: number = steps.findIndex(
    (step) => step.type === current.type && step.stepId === current.stepId,
  );

  if (index === -1) return null;

  return steps[index + offset] ?? null;
}
