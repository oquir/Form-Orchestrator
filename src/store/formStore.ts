import { v4 as uuidv4 } from "uuid";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { ZOOM_DEFAULT } from "../constants/canvasZoom";
import { GRID_BASE_COLUMNS, MAX_ROW_COLUMNS, MIN_ROW_COLUMNS } from "../constants/grid";
import { clampZoom } from "../lib/canvasZoom/canvasZoom";
import { pruneDataSourceReferencing } from "../lib/fieldDataSource/fieldDataSource";
import { slugifyFieldName, uniqueFieldName } from "../lib/fieldName/fieldName";
import { allowsManualOptions, isOptionBasedField } from "../lib/fieldOptions/fieldOptions";
import { createFieldRule, moveRule, pruneRulesReferencing } from "../lib/fieldRule/fieldRule";
import { createEmptyTooltip } from "../lib/fieldTooltip/fieldTooltip";
import {
  canTransfer,
  collectCrossingRefs,
  planLanding,
  transferGroup,
} from "../lib/fieldTransfer/fieldTransfer";
import {
  createValidationOverride,
  pruneOverridesReferencing,
} from "../lib/fieldValidationOverride/fieldValidationOverride";
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
import { reorderRows } from "../lib/rowOrder/rowOrder";
import type { CanvasField } from "../types/field";
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
import { createBanksSlice } from "./banksSlice";
import { NO_GROUPS, NO_ROWS, THEME_STORAGE_KEY } from "./formStore.constants";
import {
  allFieldNames,
  allRows,
  buildInitialFormSteps,
  buildInitialIntroSteps,
  createEmptyField,
  createEmptyRow,
  createOptions,
  crossingNotice,
  findAnyField,
  getInitialDarkMode,
  mapFieldEverywhere,
  mapRowEverywhere,
  rowsAcrossFrom,
  rowsOfTarget,
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

export const useFormStore: UseBoundStore<StoreApi<FormState>> = create<FormState>((set) => ({
  // Los bancos del simulador entran enteros desde su propio archivo, estado y acciones incluidos.
  ...createBanksSlice(set),
  formSteps: [
    {
      stepId: "step-1",
      title: "Paso 1",
      rows: [{ id: "row-1", columns: GRID_BASE_COLUMNS, fields: [] }],
    },
  ],
  introModal: { steps: [] },
  formScript: "",
  activeCanvas: { type: "formStep", stepId: "step-1" },
  selectedFieldId: null,
  canvasTool: "move",
  setupConfig: {
    isComplete: false,
    formType: null,
    hasIntroModal: false,
    introModalSteps: 1,
  },
  isSidebarOpen: true,
  isSimulatorOpen: false,
  canvasZoom: ZOOM_DEFAULT,
  canvasViewMode: "canvas",
  sidebarTab: "fields",
  rightSidebarTab: "project",
  dragPlacement: null,
  rowDropTarget: null,
  rowDrag: null,
  draggingFieldId: null,
  hoveredTransferTarget: null,
  transferNotice: null,
  isDarkMode: getInitialDarkMode(),
  lastSavedAt: null,
  setDragPlacement: (placement) => set({ dragPlacement: placement }),
  setRowDropTarget: (target) => set({ rowDropTarget: target }),
  setRowDrag: (drag) => set({ rowDrag: drag }),
  setDraggingFieldId: (fieldId) => set({ draggingFieldId: fieldId }),
  setHoveredTransferTarget: (target) => set({ hoveredTransferTarget: target }),
  dismissTransferNotice: () => set({ transferNotice: null }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  // Sube al store porque ahora lo escribe el panel derecho y lo lee el lienzo, que son dos
  // subarboles distintos. Es estado de vista, igual que sidebarTab.
  setCanvasViewMode: (mode) => set({ canvasViewMode: mode }),
  setSimulatorOpen: (open) => set({ isSimulatorOpen: open }),
  // Recorta aca y no en cada llamante: la rueda manda valores continuos y los atajos de teclado no
  // saben del rango.
  setCanvasZoom: (zoom) => set({ canvasZoom: clampZoom(zoom) }),
  // Estado de vista, como el zoom: no viaja en el borrador y al recargar vuelve a Mover.
  setCanvasTool: (tool) => set({ canvasTool: tool }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setRightSidebarTab: (tab) => set({ rightSidebarTab: tab }),
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
  updateRowStyles: (rowId, updates) =>
    set((state) =>
      mapRowEverywhere(state, rowId, (row) => ({ ...row, styles: { ...row.styles, ...updates } })),
    ),
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
  // Reordenar es solo cambiar de sitio dentro de `rows[]`: el orden de las filas no se guarda en
  // ningun campo, es el del arreglo. Por eso ni la persistencia ni la exportacion se enteran.
  // Se aplica al paso que contiene la fila; si el destino esta en otro, reorderRows lo rechaza.
  moveRow: (rowId, target) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) =>
        step.rows.some((row) => row.id === rowId)
          ? { ...step, rows: reorderRows(step.rows, rowId, target) }
          : step,
      ),
      introModal: {
        steps: state.introModal.steps.map((step) =>
          step.rows.some((row) => row.id === rowId)
            ? { ...step, rows: reorderRows(step.rows, rowId, target) }
            : step,
        ),
      },
    })),
  // Mudar de paso no toca el nombre. allFieldNames ya es global a los dos lienzos, asi que el name
  // y el id viajan intactos y ninguna referencia por id se rompe: lo unico que cambia es en que
  // pantalla se dibuja. El rodeo por el Almacen si renombraba, porque copiaba en vez de mudar.
  moveFieldToStep: (fieldId, target) =>
    set((state) => {
      const moving: CanvasField[] = transferGroup(allRows(state), fieldId);
      if (moving.length === 0) return state;

      const targetRows: CanvasRow[] = rowsOfTarget(state, target);
      if (targetRows.some((row) => row.fields.some((field) => field.id === fieldId))) return state;

      const movingIds = new Set<string>(moving.map((field) => field.id));
      const strip = (rows: CanvasRow[]): CanvasRow[] =>
        rows.map((row) => {
          const kept = row.fields.filter((field) => !movingIds.has(field.id));

          return kept.length === row.fields.length ? row : { ...row, fields: kept };
        });

      // El destino se limpia antes de plantar: la etiqueta enlazada podia vivir ya en este paso, y
      // sin esto planLanding la duplicaria en vez de moverla.
      const landed: CanvasRow[] = planLanding(strip(targetRows), moving, createEmptyRow);
      const notice: string | null = crossingNotice(
        collectCrossingRefs(rowsAcrossFrom(state, target), moving),
      );

      return {
        formSteps: state.formSteps.map((step) =>
          target.type === "formStep" && step.stepId === target.stepId
            ? { ...step, rows: landed }
            : { ...step, rows: strip(step.rows) },
        ),
        introModal: {
          steps: state.introModal.steps.map((step) =>
            target.type === "introStep" && step.stepId === target.stepId
              ? { ...step, rows: landed }
              : { ...step, rows: strip(step.rows) },
          ),
        },
        // Sin esto el campo desaparece de la pantalla y no hay forma de saber si llego.
        activeCanvas: target,
        selectedFieldId: fieldId,
        transferNotice: notice,
      };
    }),
  // La fila se muda entera y se agrega al final: sus campos ya caben en ella, es la misma fila. La
  // posicion se ajusta despues reordenando, que ya se puede arrastrando.
  moveRowToStep: (rowId, target) =>
    set((state) => {
      const row = findRowById(state, rowId);
      if (!row) return state;

      // Misma regla que al reordenar: una fila no sale de su grupo arrastrandola, y el grupo vive
      // en el paso de origen. canTransfer dice lo mismo para pintar la pestana como rechazada.
      if (!canTransfer([row], { kind: "row", rowId }).allowed) return state;

      const targetRows: CanvasRow[] = rowsOfTarget(state, target);
      if (targetRows.some((candidate) => candidate.id === rowId)) return state;

      const notice: string | null = crossingNotice(
        collectCrossingRefs(rowsAcrossFrom(state, target), row.fields),
      );
      const strip = (rows: CanvasRow[]): CanvasRow[] =>
        rows.filter((candidate) => candidate.id !== rowId);

      return {
        formSteps: state.formSteps.map((step) =>
          target.type === "formStep" && step.stepId === target.stepId
            ? { ...step, rows: [...step.rows, row] }
            : { ...step, rows: strip(step.rows) },
        ),
        introModal: {
          steps: state.introModal.steps.map((step) =>
            target.type === "introStep" && step.stepId === target.stepId
              ? { ...step, rows: [...step.rows, row] }
              : { ...step, rows: strip(step.rows) },
          ),
        },
        activeCanvas: target,
        transferNotice: notice,
      };
    }),
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
              validations: {
                ...field.validations,
                overrides: pruneOverridesReferencing(field.validations.overrides, fieldId),
              },
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
  addFieldValidationOverride: (fieldId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        validations: {
          ...field.validations,
          overrides: [...(field.validations.overrides ?? []), createValidationOverride()],
        },
      })),
    ),
  updateFieldValidationOverride: (fieldId, overrideId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        validations: {
          ...field.validations,
          overrides: (field.validations.overrides ?? []).map((override) =>
            override.id === overrideId
              ? {
                  ...override,
                  ...updates,
                  // Las reglas se fusionan en vez de reemplazarse: el panel manda un campo por vez.
                  validations: { ...override.validations, ...updates.validations },
                }
              : override,
          ),
        },
      })),
    ),
  removeFieldValidationOverride: (fieldId, overrideId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        validations: {
          ...field.validations,
          overrides: (field.validations.overrides ?? []).filter(
            (override) => override.id !== overrideId,
          ),
        },
      })),
    ),
  updateFieldStyles: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        styles: { ...field.styles, ...updates },
      })),
    ),
  // Un script en blanco se guarda como ausente y no como cadena vacia: asi "este campo no se
  // calcula" es una sola cosa en el modelo y el export no lleva la clave.
  setFieldScript: (fieldId, script) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: { ...field.logic, script: script.trim().length > 0 ? script : undefined },
      })),
    ),
  setFormScript: (script) => set({ formScript: script }),
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
  // Apagarlos borra la clave en vez de guardar false: ausente y false son lo mismo, y una sola de
  // las dos formas mantiene limpios el borrador y el JSON exportado.
  setFieldRounding: (fieldId, rounding) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        rounding: rounding || undefined,
      })),
    ),
  setFieldFormatted: (fieldId, formatted) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        formatted: formatted || undefined,
      })),
    ),
  setFieldInlineOptions: (fieldId, inline) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        inlineOptions: inline || undefined,
      })),
    ),
  // null es "los que traiga": la ausencia de la clave es un estado con sentido, no un cero.
  setFieldDecimals: (fieldId, decimals) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        decimals: decimals ?? undefined,
      })),
    ),
  // Esta guarda el false y borra el true, al reves que las dos de arriba: aca lo que hay que
  // decir es la restriccion, porque admitir negativos es el default.
  setFieldAllowsNegative: (fieldId, allows) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        allowsNegative: allows ? undefined : false,
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
  restoreDraft: (draft) =>
    set({
      formSteps: draft.formSteps,
      introModal: draft.introModal,
      formScript: draft.formScript,
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

export { findFieldById } from "./formStore.utils";

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
