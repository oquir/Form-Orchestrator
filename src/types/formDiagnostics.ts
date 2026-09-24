import type { FormStep, IntroModalStep } from "./formStructure";
import type { CanvasTarget } from "./placement";
import type { SidebarTab } from "./ui";

// Lo que encuentra la revision antes de exportar. Un error es algo que se sabe roto y bloquea la
// exportacion; un aviso solo informa, porque puede ser a proposito (mapear una hoja que llena el
// aplicativo receptor, un CSS que este navegador no reconoce).
export type ProblemSeverity = "error" | "warning";

// A donde lleva "Ir": el lienzo donde vive la cosa y, para un campo, el panel donde se corrige.
export type ProblemTarget =
  | { kind: "field"; fieldId: string; canvas: CanvasTarget; tab: SidebarTab }
  | { kind: "row"; rowId: string; canvas: CanvasTarget }
  | { kind: "group"; groupId: string; canvas: CanvasTarget }
  | { kind: "prelude" };

export interface FormProblem {
  id: string;
  severity: ProblemSeverity;
  // Donde esta, tal como se lee en la lista: el campo con su nombre tecnico, la fila, el grupo o
  // el script del formulario.
  where: string;
  message: string;
  target: ProblemTarget;
}

export interface DiagnoseFormInput {
  formSteps: FormStep[];
  introSteps: IntroModalStep[];
  formScript: string;
}
