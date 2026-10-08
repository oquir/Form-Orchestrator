import type { CanvasField } from "../../types/field";
import type { FormStep, IntroModalStep } from "../../types/formStructure";
import { isPresentationalField } from "../fieldKind/fieldKind";

// Que campos puede observar otro: en una condicion, una regla, una validacion condicional o como
// padre de un catalogo. Lo comparten todos los paneles, para que ninguno ofrezca lo que otro niega.
//
// La dependencia sigue el orden en que se llena: el modal de entrada se responde antes que el
// formulario, asi que un campo del formulario ve los dos lienzos y uno del modal solo el modal. Al
// reves, el modal se mostraria mirando un campo que todavia nadie lleno: oculto, no se valida, y
// deja pasar sin responder lo que pide.

export function dependencyCandidates(
  fieldId: string,
  formSteps: FormStep[],
  introSteps: IntroModalStep[],
): CanvasField[] {
  const introFields: CanvasField[] = introSteps.flatMap((step) =>
    step.rows.flatMap((row) => row.fields),
  );
  const livesInIntro: boolean = introFields.some((field) => field.id === fieldId);
  // Primero el modal: es el orden en que los responde el contribuyente.
  const reachable: CanvasField[] = livesInIntro
    ? introFields
    : [...introFields, ...formSteps.flatMap((step) => step.rows.flatMap((row) => row.fields))];

  // Un campo presentacional no tiene valor que observar, y ninguno se observa a si mismo.
  return reachable.filter(
    (candidate) => candidate.id !== fieldId && !isPresentationalField(candidate.type),
  );
}
