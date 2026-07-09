import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { getIndustriaComercioTemplate } from "../lib/baseTemplate";
import type { FieldTypeDef } from "../lib/fieldTypes";

export type FormType = "industria_comercio" | "retencion_industria_comercio" | "autorretencion";

export interface SetupConfig {
  isComplete: boolean;
  formType: FormType | null;
  hasIntroModal: boolean;
  introModalSteps: number;
}

export interface FieldValidations {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface FieldStyles {
  customClasses?: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface FieldLogic {
  dependencies: string[];
  typeScript: string;
}

export interface CanvasField {
  id: string;
  type: string;
  label: string;
  colSpan: number;
  validations: FieldValidations;
  styles: FieldStyles;
  logic: FieldLogic;
}

export interface CanvasRow {
  id: string;
  columns: number;
  fields: CanvasField[];
}

export interface FormStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: CanvasRow[];
}

export interface IntroModalStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: CanvasRow[];
}

export interface IntroModalState {
  steps: IntroModalStep[];
}

export interface SavedComponent {
  id: string;
  name: string;
  type: string;
  label: string;
  colSpan: number;
  validations: FieldValidations;
  styles: FieldStyles;
  logic: FieldLogic;
}

export type CanvasTarget =
  | { type: "formStep"; stepId: string }
  | { type: "introStep"; stepId: string };

export type SidebarTab = "fields" | "attributes" | "validations" | "styles" | "logic" | "library";

function createEmptyRow(): CanvasRow {
  return { id: uuidv4(), columns: 12, fields: [] };
}

function createEmptyField(type: string, label: string): CanvasField {
  return {
    id: uuidv4(),
    type,
    label,
    colSpan: 12,
    validations: {},
    styles: {},
    logic: { dependencies: [], typeScript: "" },
  };
}

interface StateSlice {
  formSteps: FormStep[];
  introModal: IntroModalState;
}

function mapRowEverywhere(
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

function mapFieldEverywhere(
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

interface FormState {
  formSteps: FormStep[];
  introModal: IntroModalState;
  activeCanvas: CanvasTarget;
  selectedFieldId: string | null;
  savedComponents: SavedComponent[];
  setupConfig: SetupConfig;
  isSidebarOpen: boolean;
  sidebarTab: SidebarTab;
  isDarkMode: boolean;
  lastSavedAt: string | null;
  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  toggleDarkMode: () => void;
  markSaved: () => void;
  selectFieldAndEdit: (fieldId: string, tab: SidebarTab) => void;
  completeSetup: (config: {
    formType: FormType;
    hasIntroModal: boolean;
    introModalSteps: number;
  }) => void;
  setActiveCanvas: (target: CanvasTarget) => void;
  updateFormStepTitle: (stepId: string, title: string) => void;
  updateFormStepSubtitle: (stepId: string, subtitle: string) => void;
  addFormStep: () => void;
  removeFormStep: (stepId: string) => void;
  updateIntroModalStepTitle: (stepId: string, title: string) => void;
  updateIntroModalStepSubtitle: (stepId: string, subtitle: string) => void;
  addIntroModalStep: () => void;
  removeIntroModalStep: (stepId: string) => void;
  addRowToActiveCanvas: () => void;
  removeRow: (rowId: string) => void;
  addFieldToRow: (rowId: string, fieldType: FieldTypeDef) => void;
  selectField: (fieldId: string | null) => void;
  updateField: (fieldId: string, updates: Partial<Pick<CanvasField, "label" | "colSpan">>) => void;
  updateFieldValidations: (fieldId: string, updates: Partial<FieldValidations>) => void;
  updateFieldStyles: (fieldId: string, updates: Partial<FieldStyles>) => void;
  updateFieldLogic: (fieldId: string, updates: Partial<Pick<FieldLogic, "typeScript">>) => void;
  toggleFieldDependency: (fieldId: string, dependsOnFieldId: string) => void;
  saveFieldAsComponent: (fieldId: string, name: string) => void;
  removeSavedComponent: (componentId: string) => void;
  addSavedComponentToRow: (rowId: string, componentId: string) => void;
  restoreDraft: (draft: {
    formSteps: FormStep[];
    introModal: IntroModalState;
    savedComponents: SavedComponent[];
    setupConfig: SetupConfig;
  }) => void;
}

function buildInitialFormSteps(formType: FormType): FormStep[] {
  return [
    {
      stepId: uuidv4(),
      title: "Paso 1",
      rows: formType === "industria_comercio" ? getIndustriaComercioTemplate() : [createEmptyRow()],
    },
  ];
}

const THEME_STORAGE_KEY = "form-orchestrator-theme";

function getInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const useFormStore = create<FormState>((set, get) => ({
  formSteps: [
    {
      stepId: "step-1",
      title: "Paso 1",
      rows: [{ id: "row-1", columns: 12, fields: [] }],
    },
  ],
  introModal: { steps: [] },
  activeCanvas: { type: "formStep", stepId: "step-1" },
  selectedFieldId: null,
  savedComponents: [],
  setupConfig: {
    isComplete: false,
    formType: null,
    hasIntroModal: false,
    introModalSteps: 1,
  },
  isSidebarOpen: true,
  sidebarTab: "fields",
  isDarkMode: getInitialDarkMode(),
  lastSavedAt: null,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  markSaved: () => set({ lastSavedAt: new Date().toISOString() }),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      window.localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      return { isDarkMode: next };
    }),
  selectFieldAndEdit: (fieldId, tab) =>
    set({ selectedFieldId: fieldId, sidebarTab: tab, isSidebarOpen: true }),
  completeSetup: (config) =>
    set(() => {
      const formSteps = buildInitialFormSteps(config.formType);
      return {
        setupConfig: { isComplete: true, ...config },
        formSteps,
        introModal: {
          steps: config.hasIntroModal
            ? Array.from({ length: config.introModalSteps }, (_, index) => ({
                stepId: uuidv4(),
                title: `Paso ${index + 1}`,
                rows: [createEmptyRow()],
              }))
            : [],
        },
        activeCanvas: { type: "formStep", stepId: formSteps[0].stepId },
        selectedFieldId: null,
      };
    }),
  setActiveCanvas: (target) => set({ activeCanvas: target, selectedFieldId: null }),
  updateFormStepTitle: (stepId, title) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) =>
        step.stepId === stepId ? { ...step, title } : step,
      ),
    })),
  updateFormStepSubtitle: (stepId, subtitle) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) =>
        step.stepId === stepId ? { ...step, subtitle } : step,
      ),
    })),
  addFormStep: () =>
    set((state) => {
      const newStep: FormStep = {
        stepId: uuidv4(),
        title: `Paso ${state.formSteps.length + 1}`,
        rows: [createEmptyRow()],
      };
      return {
        formSteps: [...state.formSteps, newStep],
        activeCanvas: { type: "formStep", stepId: newStep.stepId },
        selectedFieldId: null,
      };
    }),
  removeFormStep: (stepId) =>
    set((state) => {
      if (state.formSteps.length <= 1) return state;
      const remainingSteps = state.formSteps.filter((step) => step.stepId !== stepId);
      const wasActive =
        state.activeCanvas.type === "formStep" && state.activeCanvas.stepId === stepId;
      return {
        formSteps: remainingSteps,
        activeCanvas: wasActive
          ? { type: "formStep", stepId: remainingSteps[0].stepId }
          : state.activeCanvas,
        selectedFieldId: wasActive ? null : state.selectedFieldId,
      };
    }),
  updateIntroModalStepTitle: (stepId, title) =>
    set((state) => ({
      introModal: {
        steps: state.introModal.steps.map((step) =>
          step.stepId === stepId ? { ...step, title } : step,
        ),
      },
    })),
  updateIntroModalStepSubtitle: (stepId, subtitle) =>
    set((state) => ({
      introModal: {
        steps: state.introModal.steps.map((step) =>
          step.stepId === stepId ? { ...step, subtitle } : step,
        ),
      },
    })),
  addIntroModalStep: () =>
    set((state) => {
      const newStep: IntroModalStep = {
        stepId: uuidv4(),
        title: `Paso ${state.introModal.steps.length + 1}`,
        rows: [createEmptyRow()],
      };
      return {
        introModal: { steps: [...state.introModal.steps, newStep] },
        setupConfig: {
          ...state.setupConfig,
          hasIntroModal: true,
          introModalSteps: state.introModal.steps.length + 1,
        },
        activeCanvas: { type: "introStep", stepId: newStep.stepId },
        selectedFieldId: null,
      };
    }),
  removeIntroModalStep: (stepId) =>
    set((state) => {
      const remainingSteps = state.introModal.steps.filter((step) => step.stepId !== stepId);
      const wasActive =
        state.activeCanvas.type === "introStep" && state.activeCanvas.stepId === stepId;
      return {
        introModal: { steps: remainingSteps },
        setupConfig: {
          ...state.setupConfig,
          hasIntroModal: remainingSteps.length > 0,
          introModalSteps: remainingSteps.length,
        },
        activeCanvas: wasActive
          ? { type: "formStep", stepId: state.formSteps[0].stepId }
          : state.activeCanvas,
        selectedFieldId: wasActive ? null : state.selectedFieldId,
      };
    }),
  addRowToActiveCanvas: () =>
    set((state) => {
      const newRow = createEmptyRow();
      const stepId = state.activeCanvas.stepId;
      if (state.activeCanvas.type === "formStep") {
        return {
          formSteps: state.formSteps.map((step) =>
            step.stepId === stepId ? { ...step, rows: [...step.rows, newRow] } : step,
          ),
        };
      }
      return {
        introModal: {
          steps: state.introModal.steps.map((step) =>
            step.stepId === stepId ? { ...step, rows: [...step.rows, newRow] } : step,
          ),
        },
      };
    }),
  removeRow: (rowId) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) => ({
        ...step,
        rows: step.rows.filter((row) => row.id !== rowId),
      })),
      introModal: {
        steps: state.introModal.steps.map((step) => ({
          ...step,
          rows: step.rows.filter((row) => row.id !== rowId),
        })),
      },
    })),
  addFieldToRow: (rowId, fieldType) =>
    set((state) => {
      const newField = createEmptyField(fieldType.type, fieldType.label);
      return {
        ...mapRowEverywhere(state, rowId, (row) => ({
          ...row,
          fields: [...row.fields, newField],
        })),
        selectedFieldId: newField.id,
      };
    }),
  selectField: (fieldId) => set({ selectedFieldId: fieldId }),
  updateField: (fieldId, updates) =>
    set((state) => mapFieldEverywhere(state, fieldId, (field) => ({ ...field, ...updates }))),
  updateFieldValidations: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        validations: { ...field.validations, ...updates },
      })),
    ),
  updateFieldStyles: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        styles: { ...field.styles, ...updates },
      })),
    ),
  updateFieldLogic: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: { ...field.logic, ...updates },
      })),
    ),
  toggleFieldDependency: (fieldId, dependsOnFieldId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => {
        const alreadyDependsOn = field.logic.dependencies.includes(dependsOnFieldId);
        return {
          ...field,
          logic: {
            ...field.logic,
            dependencies: alreadyDependsOn
              ? field.logic.dependencies.filter((id) => id !== dependsOnFieldId)
              : [...field.logic.dependencies, dependsOnFieldId],
          },
        };
      }),
    ),
  saveFieldAsComponent: (fieldId, name) => {
    const state = get();
    const field = findAnyField(state, fieldId);
    if (!field) return;
    const savedComponent: SavedComponent = {
      id: uuidv4(),
      name,
      type: field.type,
      label: field.label,
      colSpan: field.colSpan,
      validations: field.validations,
      styles: field.styles,
      logic: field.logic,
    };
    set((s) => ({ savedComponents: [...s.savedComponents, savedComponent] }));
  },
  removeSavedComponent: (componentId) =>
    set((state) => ({
      savedComponents: state.savedComponents.filter((component) => component.id !== componentId),
    })),
  addSavedComponentToRow: (rowId, componentId) =>
    set((state) => {
      const component = state.savedComponents.find((c) => c.id === componentId);
      if (!component) return state;
      const newField: CanvasField = {
        id: uuidv4(),
        type: component.type,
        label: component.label,
        colSpan: component.colSpan,
        validations: component.validations,
        styles: component.styles,
        logic: component.logic,
      };
      return {
        ...mapRowEverywhere(state, rowId, (row) => ({
          ...row,
          fields: [...row.fields, newField],
        })),
        selectedFieldId: newField.id,
      };
    }),
  restoreDraft: (draft) =>
    set({
      formSteps: draft.formSteps,
      introModal: draft.introModal,
      savedComponents: draft.savedComponents,
      setupConfig: draft.setupConfig,
      activeCanvas: { type: "formStep", stepId: draft.formSteps[0].stepId },
      selectedFieldId: null,
    }),
}));

export function getActiveRows(state: {
  formSteps: FormStep[];
  introModal: IntroModalState;
  activeCanvas: CanvasTarget;
}): CanvasRow[] {
  const activeCanvas = state.activeCanvas;
  if (activeCanvas.type === "formStep") {
    const step = state.formSteps.find((s) => s.stepId === activeCanvas.stepId);
    return step ? step.rows : [];
  }
  const step = state.introModal.steps.find((s) => s.stepId === activeCanvas.stepId);
  return step ? step.rows : [];
}

export function findFieldById(rows: CanvasRow[], fieldId: string | null): CanvasField | null {
  if (!fieldId) return null;
  for (const row of rows) {
    const field = row.fields.find((f) => f.id === fieldId);
    if (field) return field;
  }
  return null;
}

function findAnyField(state: StateSlice, fieldId: string): CanvasField | null {
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

export function getAllFields(rows: CanvasRow[]): CanvasField[] {
  return rows.flatMap((row) => row.fields);
}
