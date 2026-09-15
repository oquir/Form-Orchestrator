import type { ProjectFileSummary } from "../../../types/projectFile";

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function summaryLine(summary: ProjectFileSummary): string {
  const parts: string[] = [countLabel(summary.stepCount, "paso", "pasos")];
  if (summary.introStepCount > 0) {
    parts.push(countLabel(summary.introStepCount, "paso de modal", "pasos de modal"));
  }
  parts.push(countLabel(summary.fieldCount, "campo", "campos"));

  return parts.join(" · ");
}
