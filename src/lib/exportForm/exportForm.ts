import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type { FormExport } from "../../types/exportForm";
import type { CanvasRow, FormStep, IntroModalStep } from "../../types/formStructure";
import type { SetupConfig } from "../../types/setup";
import { buildNameIndex, mapFormStep, mapRows } from "./exportForm.utils";

export function buildFormExport(
  formSteps: FormStep[],
  setupConfig: SetupConfig,
  introModalSteps: IntroModalStep[],
): FormExport {
  const allRows: CanvasRow[] = [
    ...formSteps.flatMap((step) => step.rows),
    ...introModalSteps.flatMap((step) => step.rows),
  ];
  const names: Map<string, string> = buildNameIndex(allRows);

  return {
    projectMeta: {
      formId: `frm_${Date.now()}`,
      formType: setupConfig.formType,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
    },
    setupConfig: {
      hasIntroModal: setupConfig.hasIntroModal,
      introModal: setupConfig.hasIntroModal
        ? {
            steps: introModalSteps.map((step) => ({
              stepId: step.stepId,
              title: step.title,
              subtitle: step.subtitle || undefined,
              rows: mapRows(step.rows, names),
            })),
          }
        : undefined,
    },
    formSchema: {
      gridBaseColumns: GRID_BASE_COLUMNS,
      steps: formSteps.map((step) => mapFormStep(step, names)),
    },
  };
}

export function downloadFormExport(
  formSteps: FormStep[],
  setupConfig: SetupConfig,
  introModalSteps: IntroModalStep[],
): void {
  const data: FormExport = buildFormExport(formSteps, setupConfig, introModalSteps);
  const blob: Blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement("a");
  anchor.href = url;
  anchor.download = `${data.projectMeta.formId}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
