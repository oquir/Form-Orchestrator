import type { FormProblem } from "../../../types/formDiagnostics";

export function summaryLabel(problems: FormProblem[]): string {
  const errors: number = problems.filter((problem) => problem.severity === "error").length;
  const warnings: number = problems.length - errors;
  const parts: string[] = [];

  if (errors > 0) parts.push(`${errors} ${errors === 1 ? "error" : "errores"}`);
  if (warnings > 0) parts.push(`${warnings} ${warnings === 1 ? "aviso" : "avisos"}`);

  return parts.join(" · ");
}
