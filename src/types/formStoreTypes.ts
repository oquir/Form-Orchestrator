import type { CatalogBank, CatalogEntry, CatalogSource } from "./catalog";
import type {
  ApiBinding,
  CanvasField,
  FieldCondition,
  FieldDataSource,
  FieldFileConfig,
  FieldRule,
  FieldStyles,
  FieldTooltip,
  FieldValidationOverride,
  FieldValidations,
  SavedComponent,
} from "./field";
import type { FieldTypeDef } from "./fieldTypes";
import type { FormStep, IntroModalState, RepeatableGroup } from "./formStructure";
import type { FechasMaximasPresentacion, MaxDatesSource, StoredMaxDates } from "./maxDates";
import type {
  CanvasTarget,
  DragPlacement,
  FieldPlacement,
  RowDragState,
  RowDropTarget,
} from "./placement";
import type { RichTextContent } from "./richText";
import type { FormType, SetupConfig } from "./setup";
import type { SidebarTab } from "./ui";

export interface OptionsSetup {
  title?: string;
  optionCount: number;
}

export interface FormState {
  formSteps: FormStep[];
  introModal: IntroModalState;
  // Preludio: funciones y constantes que todos los scripts de campo ven en ambito. No lee campos
  // -- {campo} no vale aca -- porque fuera de todo ambito, y sobre todo dentro de un grupo
  // repetible, esa pregunta no tiene una respuesta unica.
  formScript: string;
  activeCanvas: CanvasTarget;
  selectedFieldId: string | null;
  savedComponents: SavedComponent[];
  setupConfig: SetupConfig;
  isSidebarOpen: boolean;
  isSimulatorOpen: boolean;
  sidebarTab: SidebarTab;
  isDarkMode: boolean;
  lastSavedAt: string | null;
  catalogBank: CatalogBank;
  maxDates: StoredMaxDates;
  dragPlacement: DragPlacement | null;
  rowDropTarget: RowDropTarget | null;
  rowDrag: RowDragState | null;
  draggingFieldId: string | null;
  hoveredTransferTarget: CanvasTarget | null;
  transferNotice: string | null;
  setDragPlacement: (placement: DragPlacement | null) => void;
  setRowDropTarget: (target: RowDropTarget | null) => void;
  setRowDrag: (drag: RowDragState | null) => void;
  setDraggingFieldId: (fieldId: string | null) => void;
  setHoveredTransferTarget: (target: CanvasTarget | null) => void;
  dismissTransferNotice: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSimulatorOpen: (open: boolean) => void;
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
  moveRow: (rowId: string, target: RowDropTarget) => void;
  moveFieldToStep: (fieldId: string, target: CanvasTarget) => void;
  moveRowToStep: (rowId: string, target: CanvasTarget) => void;
  addGroupToActiveStep: () => void;
  addRowToGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Omit<RepeatableGroup, "id">>) => void;
  removeGroup: (groupId: string) => void;
  updateRowColumns: (rowId: string, columns: number) => void;
  addFieldToRow: (rowId: string, fieldType: FieldTypeDef, requested?: FieldPlacement) => void;
  removeField: (fieldId: string) => void;
  moveField: (fieldId: string, targetRowId: string, requested?: FieldPlacement) => void;
  selectField: (fieldId: string | null) => void;
  updateField: (
    fieldId: string,
    updates: Partial<Pick<CanvasField, "label" | "colSpan" | "title" | "alwaysDisabled">>,
  ) => void;
  setFieldName: (fieldId: string, name: string) => void;
  setFieldLabelFor: (labelId: string, targetFieldId: string | null) => void;
  setFieldContent: (fieldId: string, content: RichTextContent) => void;
  setFieldEnableWhen: (fieldId: string, condition: FieldCondition | null) => void;
  setFieldVisibleWhen: (fieldId: string, condition: FieldCondition | null) => void;
  updateFieldApiBinding: (
    fieldId: string,
    binding: ApiBinding | null,
    optionsSetup?: OptionsSetup,
  ) => void;
  updateFieldDataSource: (fieldId: string, dataSource: FieldDataSource | null) => void;
  setCatalogEntries: (catalogId: string, entries: CatalogEntry[]) => void;
  setCatalogSource: (catalogId: string, source: CatalogSource) => void;
  clearCatalogEntries: (catalogId: string) => void;
  // Pasar null vuelve a la tabla generada. El store no sabe generar ni editar fechas: recibe la
  // tabla ya armada, que es lo que deja la aritmetica entera en lib/maxDates.
  setMaxDates: (fechas: FechasMaximasPresentacion | null) => void;
  setMaxDatesSource: (source: MaxDatesSource) => void;
  updateFieldValidations: (fieldId: string, updates: Partial<FieldValidations>) => void;
  addFieldValidationOverride: (fieldId: string) => void;
  updateFieldValidationOverride: (
    fieldId: string,
    overrideId: string,
    updates: Partial<FieldValidationOverride>,
  ) => void;
  removeFieldValidationOverride: (fieldId: string, overrideId: string) => void;
  updateFieldStyles: (fieldId: string, updates: Partial<FieldStyles>) => void;
  setFieldScript: (fieldId: string, script: string) => void;
  setFormScript: (script: string) => void;
  addFieldRule: (fieldId: string) => void;
  updateFieldRule: (
    fieldId: string,
    ruleId: string,
    updates: Partial<Omit<FieldRule, "id">>,
  ) => void;
  removeFieldRule: (fieldId: string, ruleId: string) => void;
  reorderFieldRule: (fieldId: string, ruleId: string, offset: number) => void;
  updateFieldFileConfig: (fieldId: string, updates: Partial<FieldFileConfig>) => void;
  setFieldRounding: (fieldId: string, rounding: boolean) => void;
  setFieldFormatted: (fieldId: string, formatted: boolean) => void;
  setFieldAllowsNegative: (fieldId: string, allows: boolean) => void;
  setFieldDecimals: (fieldId: string, decimals: number | null) => void;
  setFieldInlineOptions: (fieldId: string, inline: boolean) => void;
  updateFieldTooltip: (fieldId: string, updates: Partial<FieldTooltip> | null) => void;
  addFieldOption: (fieldId: string) => void;
  removeFieldOption: (fieldId: string, optionId: string) => void;
  updateFieldOptionLabel: (fieldId: string, optionId: string, label: string) => void;
  saveFieldAsComponent: (fieldId: string, name: string) => void;
  removeSavedComponent: (componentId: string) => void;
  addSavedComponentToRow: (rowId: string, componentId: string, requested?: FieldPlacement) => void;
  restoreDraft: (draft: {
    formSteps: FormStep[];
    introModal: IntroModalState;
    formScript: string;
    savedComponents: SavedComponent[];
    setupConfig: SetupConfig;
  }) => void;
}
