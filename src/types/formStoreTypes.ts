import type {
  ApiBinding,
  CanvasField,
  FieldCondition,
  FieldFileConfig,
  FieldLogic,
  FieldRule,
  FieldStyles,
  FieldValidations,
  SavedComponent,
} from "./field";
import type { FieldTypeDef } from "./fieldTypes";
import type { FormStep, IntroModalState, RepeatableGroup } from "./formStructure";
import type { CanvasTarget, DragPlacement, FieldPlacement } from "./placement";
import type { FormType, SetupConfig } from "./setup";
import type { SidebarTab } from "./ui";

export interface OptionsSetup {
  title?: string;
  optionCount: number;
}

export interface FormState {
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
  dragPlacement: DragPlacement | null;
  setDragPlacement: (placement: DragPlacement | null) => void;
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
  setFieldEnableWhen: (fieldId: string, condition: FieldCondition | null) => void;
  setFieldVisibleWhen: (fieldId: string, condition: FieldCondition | null) => void;
  updateFieldApiBinding: (
    fieldId: string,
    binding: ApiBinding | null,
    optionsSetup?: OptionsSetup,
  ) => void;
  updateFieldValidations: (fieldId: string, updates: Partial<FieldValidations>) => void;
  updateFieldStyles: (fieldId: string, updates: Partial<FieldStyles>) => void;
  updateFieldLogic: (fieldId: string, updates: Partial<Pick<FieldLogic, "typeScript">>) => void;
  setFieldFormula: (fieldId: string, formula: string) => void;
  addFieldRule: (fieldId: string) => void;
  updateFieldRule: (
    fieldId: string,
    ruleId: string,
    updates: Partial<Omit<FieldRule, "id">>,
  ) => void;
  removeFieldRule: (fieldId: string, ruleId: string) => void;
  reorderFieldRule: (fieldId: string, ruleId: string, offset: number) => void;
  updateFieldFileConfig: (fieldId: string, updates: Partial<FieldFileConfig>) => void;
  toggleFieldDependency: (fieldId: string, dependsOnFieldId: string) => void;
  addFieldOption: (fieldId: string) => void;
  removeFieldOption: (fieldId: string, optionId: string) => void;
  updateFieldOptionLabel: (fieldId: string, optionId: string, label: string) => void;
  saveFieldAsComponent: (fieldId: string, name: string) => void;
  removeSavedComponent: (componentId: string) => void;
  addSavedComponentToRow: (rowId: string, componentId: string, requested?: FieldPlacement) => void;
  restoreDraft: (draft: {
    formSteps: FormStep[];
    introModal: IntroModalState;
    savedComponents: SavedComponent[];
    setupConfig: SetupConfig;
  }) => void;
}
