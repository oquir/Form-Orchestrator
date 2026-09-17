import type { FormProblem } from "../../types/formDiagnostics";

export interface UseExportReviewResult {
  problems: FormProblem[] | null;
  hasErrors: boolean;
  requestExport: () => void;
  exportAnyway: () => void;
  goTo: (problem: FormProblem) => void;
  close: () => void;
}

// Lo que hay que llevar a la vista despues del commit que cambia de paso.
export interface PendingReveal {
  kind: "field" | "row" | "band";
  id: string;
}
