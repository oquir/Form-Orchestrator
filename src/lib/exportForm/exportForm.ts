import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type { CanvasRow, FormStep, IntroModalStep } from "../../types/formStructure";
import type { SetupConfig } from "../../types/setup";
import { exportableOptions } from "../fieldOptions/fieldOptions";
import { groupFields } from "../repeatableGroup/repeatableGroup";
import { buildGroupZodSchema, buildZodSchema } from "../zodSchema/zodSchema";
import type {
  ExportedRepeatableGroup,
  ExportedRow,
  ExportedStep,
  FormExport,
} from "./exportForm.types";
import {
  buildNameIndex,
  resolveCondition,
  resolveDependencies,
  resolveRules,
} from "./exportForm.utils";

function mapRows(rows: CanvasRow[], names: Map<string, string>): ExportedRow[] {
  return rows.map((row) => ({
    rowId: row.id,
    columns: row.columns,
    groupId: row.groupId,
    fields: row.fields.map((field) => ({
      fieldId: field.id,
      name: field.name,
      type: field.type,
      label: field.label,
      colStart: field.colStart,
      colSpan: field.colSpan,
      styles: field.styles,
      validations: { zodSchema: buildZodSchema(field) },
      logic: {
        dependencies: resolveDependencies(field, names),
        typeScript: field.logic.typeScript,
        formula: field.logic.formula,
        rules: resolveRules(field, names),
      },
      title: field.title,
      options: exportableOptions(field),
      fileConfig: field.fileConfig,
      alwaysDisabled: field.alwaysDisabled,
      enableWhen: resolveCondition(field.enableWhen, names),
      visibleWhen: resolveCondition(field.visibleWhen, names),
      apiBinding: field.apiBinding,
    })),
  }));
}

function mapGroups(step: FormStep): ExportedRepeatableGroup[] | undefined {
  if (!step.groups || step.groups.length === 0) return undefined;

  return step.groups.map((group) => ({
    groupId: group.id,
    name: group.name,
    title: group.title,
    min: group.min,
    max: group.max,
    arrayPath: group.arrayPath,
    zodSchema: buildGroupZodSchema(group, groupFields(step.rows, group.id)),
  }));
}

function mapFormStep(step: FormStep, names: Map<string, string>): ExportedStep {
  return {
    stepId: step.stepId,
    title: step.title,
    subtitle: step.subtitle || undefined,
    rows: mapRows(step.rows, names),
    groups: mapGroups(step),
  };
}

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
