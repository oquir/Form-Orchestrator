import type { CanvasRow, FormStep, IntroModalStep, SetupConfig } from "../../types/storeTypes";
import { buildZodSchema } from "../zodSchema/zodSchema";

function mapRows(rows: CanvasRow[]) {
  return rows.map((row) => ({
    rowId: row.id,
    columns: row.columns,
    fields: row.fields.map((field) => ({
      fieldId: field.id,
      type: field.type,
      label: field.label,
      colSpan: field.colSpan,
      styles: field.styles,
      validations: { zodSchema: buildZodSchema(field) },
      logic: field.logic,
      title: field.title,
      options: field.options,
      fileConfig: field.fileConfig,
      alwaysDisabled: field.alwaysDisabled,
      enableWhen: field.enableWhen,
    })),
  }));
}

export function buildFormExport(
  formSteps: FormStep[],
  setupConfig: SetupConfig,
  introModalSteps: IntroModalStep[],
) {
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
              rows: mapRows(step.rows),
            })),
          }
        : undefined,
    },
    formSchema: {
      gridBaseColumns: 16,
      steps: formSteps.map((step) => ({
        stepId: step.stepId,
        title: step.title,
        subtitle: step.subtitle || undefined,
        rows: mapRows(step.rows),
      })),
    },
  };
}

export function downloadFormExport(
  formSteps: FormStep[],
  setupConfig: SetupConfig,
  introModalSteps: IntroModalStep[],
) {
  const data = buildFormExport(formSteps, setupConfig, introModalSteps);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${data.projectMeta.formId}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
