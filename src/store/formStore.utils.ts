import { v4 as uuidv4 } from "uuid";
import { GRID_BASE_COLUMNS } from "../constants/grid";
import {
  getIndustriaComercioFormTemplate,
  getIndustriaComercioIntroTemplate,
} from "../lib/baseTemplate/baseTemplate";
import { INDUSTRIA_COMERCIO_FORM_STEPS } from "../lib/baseTemplate/baseTemplate.constants";
import type { FormStepTemplate, IntroStepTemplate } from "../lib/baseTemplate/baseTemplate.types";
import { collectFieldNames, slugifyFieldName, uniqueFieldName } from "../lib/fieldName/fieldName";
import type { CanvasField, FieldOption } from "../types/field";
import type { CanvasRow, FormStep, IntroModalStep } from "../types/formStructure";
import type { FieldPlacement } from "../types/placement";
import type { FormType } from "../types/setup";
import type { StateSlice } from "../types/store";
import { findFieldById } from "./formStore";
import { THEME_STORAGE_KEY } from "./formStore.constants";

export function findAnyField(state: StateSlice, fieldId: string): CanvasField | null {
  for (const step of state.formSteps) {
    const field = findFieldById(step.rows, fieldId);
    if (field) return field;
  }

  for (const step of state.introModal.steps) {
    const field = findFieldById(step.rows, fieldId);
    if (field) return field;
  }

  return null;
}

export function getInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function buildInitialFormSteps(formType: FormType): FormStep[] {
  const isIndustriaComercio: boolean = formType === "industria_comercio";
  const stepCount: number = isIndustriaComercio ? INDUSTRIA_COMERCIO_FORM_STEPS : 1;
  const templates: FormStepTemplate[] = isIndustriaComercio
    ? getIndustriaComercioFormTemplate()
    : [];

  return Array.from({ length: stepCount }, (_, index) => {
    const template: FormStepTemplate | undefined = templates[index];

    return {
      stepId: uuidv4(),
      title: template?.title ?? `Paso ${index + 1}`,
      subtitle: template?.subtitle,
      rows: template?.rows ?? [createEmptyRow()],
      groups: template?.groups,
    };
  });
}

export function buildInitialIntroSteps(formType: FormType, stepCount: number): IntroModalStep[] {
  const templates: IntroStepTemplate[] =
    formType === "industria_comercio" ? getIndustriaComercioIntroTemplate() : [];

  return Array.from({ length: stepCount }, (_, index) => {
    const template: IntroStepTemplate | undefined = templates[index];

    return {
      stepId: uuidv4(),
      title: template?.title ?? `Paso ${index + 1}`,
      subtitle: template?.subtitle,
      rows: template?.rows ?? [createEmptyRow()],
    };
  });
}

export function mapFieldEverywhere(
  slice: StateSlice,
  fieldId: string,
  updater: (field: CanvasField) => CanvasField,
): StateSlice {
  const applyTo = (rows: CanvasRow[]) =>
    rows.map((row) => ({
      ...row,
      fields: row.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }));

  return {
    formSteps: slice.formSteps.map((step) => ({
      ...step,
      rows: applyTo(step.rows),
    })),
    introModal: {
      steps: slice.introModal.steps.map((step) => ({
        ...step,
        rows: applyTo(step.rows),
      })),
    },
  };
}

export function createOptions(optionCount: number): FieldOption[] {
  return Array.from({ length: Math.max(2, optionCount) }, (_, index) => ({
    id: uuidv4(),
    label: `Opción ${index + 1}`,
  }));
}

export function mapRowEverywhere(
  slice: StateSlice,
  rowId: string,
  updater: (row: CanvasRow) => CanvasRow,
): StateSlice {
  const applyTo = (rows: CanvasRow[]) => rows.map((row) => (row.id === rowId ? updater(row) : row));

  return {
    formSteps: slice.formSteps.map((step) => ({
      ...step,
      rows: applyTo(step.rows),
    })),
    introModal: {
      steps: slice.introModal.steps.map((step) => ({
        ...step,
        rows: applyTo(step.rows),
      })),
    },
  };
}

export function createEmptyRow(): CanvasRow {
  return { id: uuidv4(), columns: GRID_BASE_COLUMNS, fields: [] };
}

export function allFieldNames(slice: StateSlice, exceptFieldId?: string): Set<string> {
  const rows: CanvasRow[] = [
    ...slice.formSteps.flatMap((step) => step.rows),
    ...slice.introModal.steps.flatMap((step) => step.rows),
  ];

  return collectFieldNames(rows, exceptFieldId);
}

export function createEmptyField(
  type: string,
  label: string,
  placement: FieldPlacement,
  taken: Set<string>,
): CanvasField {
  const field: CanvasField = {
    id: uuidv4(),
    name: uniqueFieldName(slugifyFieldName(label), taken),
    type,
    label,
    colStart: placement.colStart,
    colSpan: placement.colSpan,
    validations: {},
    styles: {},
    logic: { dependencies: [], typeScript: "" },
  };

  if (type === "file") {
    field.fileConfig = { acceptedFormats: [], maxSizeMB: 10 };
  }

  return field;
}
