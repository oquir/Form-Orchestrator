import { v4 as uuidv4 } from "uuid";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { GRID_BASE_COLUMNS, MAX_ROW_COLUMNS, MIN_ROW_COLUMNS } from "../constants/grid";
import { getIndustriaComercioTemplate } from "../lib/baseTemplate/baseTemplate";
import {
  getFreeRuns,
  getMaxSpanAt,
  repackRow,
  resolvePlacement,
  sortByColumn,
} from "../lib/rowLayout/rowLayout";
import type { FormState } from "../types/formStoreTypes";
import type {
  CanvasField,
  CanvasRow,
  CanvasTarget,
  FieldPlacement,
  FormStep,
  FormType,
  IntroModalState,
  IntroModalStep,
  SavedComponent,
  StateSlice,
} from "../types/storeTypes";

function createEmptyRow(): CanvasRow {
  return { id: uuidv4(), columns: GRID_BASE_COLUMNS, fields: [] };
}

function createEmptyField(
  type: string,
  label: string,
  placement: FieldPlacement,
  extra?: { title?: string; optionCount?: number },
): CanvasField {
  const field: CanvasField = {
    id: uuidv4(),
    type,
    label,
    colStart: placement.colStart,
    colSpan: placement.colSpan,
    validations: {},
    styles: {},
    logic: { dependencies: [], typeScript: "" },
  };

  if (type === "toggle_group" || type === "radio_group") {
    const optionCount = Math.max(2, extra?.optionCount ?? 2);
    field.title = extra?.title?.trim() || undefined;
    field.options = Array.from({ length: optionCount }, (_, index) => ({
      id: uuidv4(),
      label: `Opción ${index + 1}`,
    }));
  }

  if (type === "file") {
    field.fileConfig = { acceptedFormats: [], maxSizeMB: 10 };
  }

  return field;
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

export function findRowById(slice: StateSlice, rowId: string): CanvasRow | null {
  for (const step of slice.formSteps) {
    const row = step.rows.find((r) => r.id === rowId);
    if (row) return row;
  }
  for (const step of slice.introModal.steps) {
    const row = step.rows.find((r) => r.id === rowId);
    if (row) return row;
  }
  return null;
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

const THEME_STORAGE_KEY: string = "form-orchestrator-theme";

function getInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const useFormStore: UseBoundStore<StoreApi<FormState>> = create<FormState>((set, get) => ({
  formSteps: [
    {
      stepId: "step-1",
      title: "Paso 1",
      rows: [{ id: "row-1", columns: GRID_BASE_COLUMNS, fields: [] }],
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
  dragPlacement: null,
  isDarkMode: getInitialDarkMode(),
  lastSavedAt: null,
  setDragPlacement: (placement) => set({ dragPlacement: placement }),
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
  updateRowColumns: (rowId, columns) =>
    set((state) => {
      const row = findRowById(state, rowId);
      if (!row) return state;
      const nextColumns = Math.max(
        MIN_ROW_COLUMNS,
        Math.min(MAX_ROW_COLUMNS, Math.round(columns)),
        row.fields.length,
      );
      return mapRowEverywhere(state, rowId, (current) => repackRow(current, nextColumns));
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
  addFieldToRow: (rowId, fieldType, extra, requested) =>
    set((state) => {
      const row = findRowById(state, rowId);
      if (!row) return state;
      const placement = resolvePlacement(row, GRID_BASE_COLUMNS, requested);
      if (!placement) return state;
      const newField = createEmptyField(fieldType.type, fieldType.label, placement, extra);
      return {
        ...mapRowEverywhere(state, rowId, (current) => ({
          ...current,
          fields: [...current.fields, newField],
        })),
        selectedFieldId: newField.id,
      };
    }),
  removeField: (fieldId) =>
    set((state) => {
      const applyTo = (rows: CanvasRow[]) =>
        rows.map((row) => ({
          ...row,
          fields: row.fields
            .filter((field) => field.id !== fieldId)
            .map((field) =>
              field.enableWhen?.fieldId === fieldId ? { ...field, enableWhen: undefined } : field,
            ),
        }));
      return {
        formSteps: state.formSteps.map((step) => ({ ...step, rows: applyTo(step.rows) })),
        introModal: {
          steps: state.introModal.steps.map((step) => ({ ...step, rows: applyTo(step.rows) })),
        },
        selectedFieldId: state.selectedFieldId === fieldId ? null : state.selectedFieldId,
      };
    }),
  moveField: (fieldId, targetRowId, requested) =>
    set((state) => {
      const movedField = findAnyField(state, fieldId);
      const targetRow = findRowById(state, targetRowId);
      if (!movedField || !targetRow) return state;

      const placement = resolvePlacement(targetRow, movedField.colSpan, requested, fieldId);
      if (!placement) return state;

      const placed: CanvasField = { ...movedField, ...placement };
      const applyTo = (rows: CanvasRow[]): CanvasRow[] =>
        rows.map((row) => {
          const withoutField = row.fields.filter((f) => f.id !== fieldId);
          if (row.id !== targetRowId) {
            return withoutField.length === row.fields.length
              ? row
              : { ...row, fields: withoutField };
          }
          return { ...row, fields: sortByColumn([...withoutField, placed]) };
        });

      return {
        formSteps: state.formSteps.map((step) => ({ ...step, rows: applyTo(step.rows) })),
        introModal: {
          steps: state.introModal.steps.map((step) => ({ ...step, rows: applyTo(step.rows) })),
        },
      };
    }),
  setFieldEnableWhen: (fieldId, condition) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        enableWhen: condition ?? undefined,
      })),
    ),
  updateFieldApiBinding: (fieldId, binding) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        apiBinding: binding ?? undefined,
      })),
    ),
  selectField: (fieldId) => set({ selectedFieldId: fieldId }),
  updateField: (fieldId, updates) =>
    set((state) => {
      if (updates.colSpan === undefined) {
        return mapFieldEverywhere(state, fieldId, (field) => ({ ...field, ...updates }));
      }
      const row = findRowContainingField(state, fieldId);
      if (!row) return state;
      const maxSpan = getMaxSpanAt(
        getFreeRuns(row.fields, row.columns, fieldId),
        row.fields.find((f) => f.id === fieldId)?.colStart ?? 1,
      );
      return mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        ...updates,
        colSpan: Math.max(1, Math.min(updates.colSpan ?? field.colSpan, maxSpan)),
      }));
    }),
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
  updateFieldFileConfig: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        fileConfig: {
          acceptedFormats: field.fileConfig?.acceptedFormats ?? [],
          maxSizeMB: field.fileConfig?.maxSizeMB ?? 10,
          ...updates,
        },
      })),
    ),
  addFieldOption: (fieldId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        options: [
          ...(field.options ?? []),
          { id: uuidv4(), label: `Opción ${(field.options?.length ?? 0) + 1}` },
        ],
      })),
    ),
  removeFieldOption: (fieldId, optionId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        options: (field.options ?? []).filter((option) => option.id !== optionId),
      })),
    ),
  updateFieldOptionLabel: (fieldId, optionId, label) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        options: (field.options ?? []).map((option) =>
          option.id === optionId ? { ...option, label } : option,
        ),
      })),
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
      title: field.title,
      options: field.options,
      fileConfig: field.fileConfig,
      alwaysDisabled: field.alwaysDisabled,
      enableWhen: field.enableWhen,
      apiBinding: field.apiBinding,
    };
    set((s) => ({ savedComponents: [...s.savedComponents, savedComponent] }));
  },
  removeSavedComponent: (componentId) =>
    set((state) => ({
      savedComponents: state.savedComponents.filter((component) => component.id !== componentId),
    })),
  addSavedComponentToRow: (rowId, componentId, requested) =>
    set((state) => {
      const component = state.savedComponents.find((c) => c.id === componentId);
      const row = findRowById(state, rowId);
      if (!component || !row) return state;
      const placement = resolvePlacement(row, component.colSpan, requested);
      if (!placement) return state;
      const newField: CanvasField = {
        id: uuidv4(),
        type: component.type,
        label: component.label,
        colStart: placement.colStart,
        colSpan: placement.colSpan,
        validations: component.validations,
        styles: component.styles,
        logic: component.logic,
        title: component.title,
        options: component.options?.map((option) => ({ ...option, id: uuidv4() })),
        fileConfig: component.fileConfig
          ? { ...component.fileConfig, acceptedFormats: [...component.fileConfig.acceptedFormats] }
          : undefined,
        alwaysDisabled: component.alwaysDisabled,
        enableWhen: component.enableWhen ? { ...component.enableWhen } : undefined,
        apiBinding: component.apiBinding ? { ...component.apiBinding } : undefined,
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

export function findRowContainingField(
  state: { formSteps: FormStep[]; introModal: IntroModalState },
  fieldId: string | null,
): CanvasRow | null {
  if (!fieldId) return null;
  for (const step of state.formSteps) {
    for (const row of step.rows) {
      if (row.fields.some((f) => f.id === fieldId)) return row;
    }
  }
  for (const step of state.introModal.steps) {
    for (const row of step.rows) {
      if (row.fields.some((f) => f.id === fieldId)) return row;
    }
  }
  return null;
}
