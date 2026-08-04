import { v4 as uuidv4 } from "uuid";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { GRID_BASE_COLUMNS, MAX_ROW_COLUMNS, MIN_ROW_COLUMNS } from "../constants/grid";
import { loadCatalogBank, saveCatalogBank } from "../lib/catalogBank/catalogBank";
import { pruneDataSourceReferencing } from "../lib/fieldDataSource/fieldDataSource";
import { slugifyFieldName, uniqueFieldName } from "../lib/fieldName/fieldName";
import {
  allowsManualOptions,
  exportableOptions,
  isOptionBasedField,
} from "../lib/fieldOptions/fieldOptions";
import { createFieldRule, moveRule, pruneRulesReferencing } from "../lib/fieldRule/fieldRule";
import { createEmptyTooltip, exportableTooltip } from "../lib/fieldTooltip/fieldTooltip";
import {
  clampGroupBounds,
  createRepeatableGroup,
  detachGroup,
  groupNamesInUse,
  normalizeGroupRows,
  pruneEmptyGroups,
} from "../lib/repeatableGroup/repeatableGroup";
import {
  getFreeRuns,
  getMaxSpanAt,
  repackRow,
  resolvePlacement,
  sortByColumn,
} from "../lib/rowLayout/rowLayout";
import type { CatalogBank } from "../types/catalog";
import type { CanvasField, SavedComponent } from "../types/field";
import type { FormState } from "../types/formStoreTypes";
import type {
  CanvasRow,
  FormStep,
  IntroModalState,
  IntroModalStep,
  RepeatableGroup,
} from "../types/formStructure";
import type { CanvasTarget } from "../types/placement";
import type { StateSlice } from "../types/store";
import { NO_GROUPS, NO_ROWS, THEME_STORAGE_KEY } from "./formStore.constants";
import {
  allFieldNames,
  buildInitialFormSteps,
  buildInitialIntroSteps,
  createEmptyField,
  createEmptyRow,
  createOptions,
  findAnyField,
  getInitialDarkMode,
  mapFieldEverywhere,
  mapRowEverywhere,
} from "./formStore.utils";

// El unico store de la aplicacion. Sostiene los dos lienzos a la vez -formSteps y las pantallas
// del modal de intro- y casi toda mutacion se aplica al que contenga el id, sin preguntar cual
// esta activo: de ahi mapRowEverywhere y mapFieldEverywhere.

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
  isSimulatorOpen: false,
  sidebarTab: "fields",
  dragPlacement: null,
  isDarkMode: getInitialDarkMode(),
  lastSavedAt: null,
  catalogBank: loadCatalogBank(),
  setDragPlacement: (placement) => set({ dragPlacement: placement }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSimulatorOpen: (open) => set({ isSimulatorOpen: open }),
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
            ? buildInitialIntroSteps(config.formType, config.introModalSteps)
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
      // El piso es la cantidad de campos que ya hay: nunca menos de una columna por campo, o
      // alguno se quedaria sin sitio al reempaquetar.
      const nextColumns = Math.max(
        MIN_ROW_COLUMNS,
        Math.min(MAX_ROW_COLUMNS, Math.round(columns)),
        row.fields.length,
      );
      return mapRowEverywhere(state, rowId, (current) => repackRow(current, nextColumns));
    }),
  removeRow: (rowId) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) =>
        pruneEmptyGroups({ ...step, rows: step.rows.filter((row) => row.id !== rowId) }),
      ),
      introModal: {
        steps: state.introModal.steps.map((step) => ({
          ...step,
          rows: step.rows.filter((row) => row.id !== rowId),
        })),
      },
    })),
  addGroupToActiveStep: () =>
    set((state) => {
      if (state.activeCanvas.type !== "formStep") return state;

      const stepId: string = state.activeCanvas.stepId;
      const taken: Set<string> = new Set([
        ...allFieldNames(state),
        ...groupNamesInUse(state.formSteps),
      ]);
      const group: RepeatableGroup = createRepeatableGroup("Grupo repetible", taken);
      const row: CanvasRow = { ...createEmptyRow(), groupId: group.id };

      return {
        formSteps: state.formSteps.map((step) =>
          step.stepId === stepId
            ? { ...step, rows: [...step.rows, row], groups: [...(step.groups ?? []), group] }
            : step,
        ),
      };
    }),
  addRowToGroup: (groupId) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) => {
        if (!(step.groups ?? []).some((group) => group.id === groupId)) return step;

        const row: CanvasRow = { ...createEmptyRow(), groupId };

        return { ...step, rows: normalizeGroupRows([...step.rows, row]) };
      }),
    })),
  updateGroup: (groupId, updates) =>
    set((state) => {
      const taken: Set<string> = allFieldNames(state);

      for (const step of state.formSteps) {
        for (const group of step.groups ?? []) {
          if (group.id !== groupId) taken.add(group.name);
        }
      }

      return {
        formSteps: state.formSteps.map((step) => {
          const current: RepeatableGroup | undefined = (step.groups ?? []).find(
            (group) => group.id === groupId,
          );

          if (!current) return step;

          const merged: RepeatableGroup = { ...current, ...updates };
          const next: RepeatableGroup = {
            ...merged,
            ...clampGroupBounds(merged.min, merged.max),
            name:
              updates.name === undefined
                ? current.name
                : uniqueFieldName(slugifyFieldName(updates.name), taken),
          };
          const movedArray: boolean = next.arrayPath !== current.arrayPath;

          return {
            ...step,
            groups: (step.groups ?? []).map((group) => (group.id === groupId ? next : group)),
            // Cambiar el arrayPath del grupo invalida el mapeo de todos sus campos, por la misma
            // razon que sacarlos del grupo: la ruta apuntaba al item del array anterior.
            rows: movedArray
              ? step.rows.map((row) =>
                  row.groupId === groupId
                    ? {
                        ...row,
                        fields: row.fields.map((field) =>
                          field.apiBinding?.kind === "mapped"
                            ? { ...field, apiBinding: undefined }
                            : field,
                        ),
                      }
                    : row,
                )
              : step.rows,
          };
        }),
      };
    }),
  removeGroup: (groupId) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) => detachGroup(step, groupId)),
    })),
  addFieldToRow: (rowId, fieldType, requested) =>
    set((state) => {
      const row = findRowById(state, rowId);
      if (!row) return state;
      const placement = resolvePlacement(row, GRID_BASE_COLUMNS, requested);
      if (!placement) return state;
      const newField = createEmptyField(
        fieldType.type,
        fieldType.label,
        placement,
        allFieldNames(state),
      );
      return {
        ...mapRowEverywhere(state, rowId, (current) => ({
          ...current,
          fields: [...current.fields, newField],
        })),
        selectedFieldId: newField.id,
      };
    }),
  // Borrar un campo obliga a limpiar todo lo que le apuntaba, o quedarian referencias colgando:
  // condiciones, reglas y la etiqueta externa que lo tuviera como destino. La etiqueta sobrevive
  // sin vinculo en vez de borrarse, igual que un hueco en la fila se conserva.
  removeField: (fieldId) =>
    set((state) => {
      const applyTo = (rows: CanvasRow[]) =>
        rows.map((row) => ({
          ...row,
          fields: row.fields
            .filter((field) => field.id !== fieldId)
            .map((field) => ({
              ...field,
              enableWhen: field.enableWhen?.fieldId === fieldId ? undefined : field.enableWhen,
              visibleWhen: field.visibleWhen?.fieldId === fieldId ? undefined : field.visibleWhen,
              labelFor: field.labelFor === fieldId ? undefined : field.labelFor,
              dataSource: pruneDataSourceReferencing(field.dataSource, fieldId),
              logic: {
                ...field.logic,
                rules: pruneRulesReferencing(field.logic.rules, fieldId),
              },
            })),
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

      // Sin hueco valido el movimiento se descarta entero: la fila destino queda intacta y el
      // campo se queda donde estaba. Nunca se desplaza a un vecino para hacer sitio.
      const placement = resolvePlacement(targetRow, movedField.colSpan, requested, fieldId);
      if (!placement) return state;

      // Sacar un campo de un grupo le quita el mapeo: su ruta esta dentro del item del array
      // (actividades[].algo) y fuera del grupo no significa nada.
      const sourceRow = findRowContainingField(state, fieldId);
      const leavesItemScope: boolean =
        sourceRow?.groupId !== targetRow.groupId && movedField.apiBinding?.kind === "mapped";

      const placed: CanvasField = {
        ...movedField,
        ...placement,
        apiBinding: leavesItemScope ? undefined : movedField.apiBinding,
      };
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
  setFieldName: (fieldId, name) =>
    set((state) => {
      const slug: string = slugifyFieldName(name);
      const unique: string = uniqueFieldName(slug, allFieldNames(state, fieldId));

      return mapFieldEverywhere(state, fieldId, (field) => ({ ...field, name: unique }));
    }),

  setFieldContent: (fieldId, content) =>
    set((state) => mapFieldEverywhere(state, fieldId, (field) => ({ ...field, content }))),

  // El vinculo vive en la etiqueta, no en el campo, asi que solo hay un extremo que mantener.
  // La relacion es uno a uno: si otra etiqueta ya apuntaba a ese campo, se la desvincula aca
  // mismo. Que un campo tenga etiqueta externa nunca se guarda, se deduce con hasLinkedLabel.
  setFieldLabelFor: (labelId, targetFieldId) =>
    set((state) => {
      const applyTo = (rows: CanvasRow[]) =>
        rows.map((row) => ({
          ...row,
          fields: row.fields.map((field) => {
            if (field.id === labelId) {
              return { ...field, labelFor: targetFieldId ?? undefined };
            }

            const stealsTarget: boolean =
              targetFieldId !== null && field.labelFor === targetFieldId;

            return stealsTarget ? { ...field, labelFor: undefined } : field;
          }),
        }));

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
  setFieldVisibleWhen: (fieldId, condition) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        visibleWhen: condition ?? undefined,
      })),
    ),
  updateFieldApiBinding: (fieldId, binding, optionsSetup) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => {
        const next: CanvasField = { ...field, apiBinding: binding ?? undefined };
        if (!isOptionBasedField(next.type)) return next;

        if (!allowsManualOptions(next)) {
          next.options = undefined;
          return next;
        }

        if (optionsSetup) {
          next.title = optionsSetup.title?.trim() || undefined;
          next.options = createOptions(optionsSetup.optionCount);
        }
        return next;
      }),
    ),
  // Declarar un catalogo descarta las opciones autoradas, igual que salir de "excluido":
  // no se guardan datos que el JSON ya no va a poder llevar.
  updateFieldDataSource: (fieldId, dataSource) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => {
        const next: CanvasField = { ...field, dataSource: dataSource ?? undefined };
        if (isOptionBasedField(next.type) && !allowsManualOptions(next)) next.options = undefined;

        return next;
      }),
    ),
  // El banco no entra al borrador: se guarda en su propia clave y sobrevive a descartarlo.
  setCatalogEntries: (catalogId, entries) =>
    set((state) => {
      const catalogBank: CatalogBank = {
        ...state.catalogBank,
        [catalogId]: { source: "custom", entries },
      };
      saveCatalogBank(catalogBank);

      return { catalogBank };
    }),
  // Cambiar de origen conserva lo cargado: volver a lo personalizado no obliga a pegarlo de nuevo.
  setCatalogSource: (catalogId, source) =>
    set((state) => {
      const stored = state.catalogBank[catalogId];
      if (!stored) return state;

      const catalogBank: CatalogBank = { ...state.catalogBank, [catalogId]: { ...stored, source } };
      saveCatalogBank(catalogBank);

      return { catalogBank };
    }),
  clearCatalogEntries: (catalogId) =>
    set((state) => {
      const catalogBank: CatalogBank = { ...state.catalogBank };
      delete catalogBank[catalogId];
      saveCatalogBank(catalogBank);

      return { catalogBank };
    }),
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
  setFieldFormula: (fieldId, formula) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: { ...field.logic, formula: formula.trim().length > 0 ? formula : undefined },
      })),
    ),
  addFieldRule: (fieldId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: { ...field.logic, rules: [...(field.logic.rules ?? []), createFieldRule()] },
      })),
    ),
  updateFieldRule: (fieldId, ruleId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: {
          ...field.logic,
          rules: (field.logic.rules ?? []).map((rule) =>
            rule.id === ruleId ? { ...rule, ...updates } : rule,
          ),
        },
      })),
    ),
  removeFieldRule: (fieldId, ruleId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: {
          ...field.logic,
          rules: (field.logic.rules ?? []).filter((rule) => rule.id !== ruleId),
        },
      })),
    ),
  reorderFieldRule: (fieldId, ruleId, offset) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: { ...field.logic, rules: moveRule(field.logic.rules ?? [], ruleId, offset) },
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
  updateFieldTooltip: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        tooltip: updates ? { ...(field.tooltip ?? createEmptyTooltip()), ...updates } : undefined,
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
      options: exportableOptions(field),
      fileConfig: field.fileConfig,
      alwaysDisabled: field.alwaysDisabled,
      enableWhen: field.enableWhen,
      visibleWhen: field.visibleWhen,
      apiBinding: field.apiBinding,
      tooltip: exportableTooltip(field),
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
        name: uniqueFieldName(slugifyFieldName(component.label), allFieldNames(state)),
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
        visibleWhen: component.visibleWhen ? { ...component.visibleWhen } : undefined,
        apiBinding: component.apiBinding ? { ...component.apiBinding } : undefined,
        tooltip: component.tooltip ? { ...component.tooltip } : undefined,
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

// Selectores del lienzo activo. Devuelven NO_ROWS / NO_GROUPS y no un [] recien creado, porque
// Zustand compara por identidad y un vacio nuevo en cada llamada provoca un bucle de renders.
export function getActiveRows(state: {
  formSteps: FormStep[];
  introModal: IntroModalState;
  activeCanvas: CanvasTarget;
}): CanvasRow[] {
  const activeCanvas = state.activeCanvas;

  if (activeCanvas.type === "formStep") {
    const step = state.formSteps.find((s) => s.stepId === activeCanvas.stepId);
    return step ? step.rows : NO_ROWS;
  }

  const step = state.introModal.steps.find((s) => s.stepId === activeCanvas.stepId);

  return step ? step.rows : NO_ROWS;
}

export function getActiveGroups(state: {
  formSteps: FormStep[];
  activeCanvas: CanvasTarget;
}): RepeatableGroup[] {
  // El lienzo del modal de intro no admite grupos repetibles: IntroModalStep no tiene `groups`.
  if (state.activeCanvas.type !== "formStep") return NO_GROUPS;

  const step = state.formSteps.find((s) => s.stepId === state.activeCanvas.stepId);

  return step?.groups ?? NO_GROUPS;
}

export function findGroupForField(
  state: StateSlice,
  fieldId: string | null,
): RepeatableGroup | null {
  if (!fieldId) return null;

  for (const step of state.formSteps) {
    const row = step.rows.find((r) => r.fields.some((f) => f.id === fieldId));
    if (!row) continue;

    return (step.groups ?? []).find((group) => group.id === row.groupId) ?? null;
  }

  return null;
}

export function findFieldById(rows: CanvasRow[], fieldId: string | null): CanvasField | null {
  if (!fieldId) return null;

  for (const row of rows) {
    const field = row.fields.find((f) => f.id === fieldId);
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
