import type { FieldTypeDef } from "./fieldTypes";
import type {
  CanvasField,
  CanvasTarget,
  EnableCondition,
  FieldFileConfig,
  FieldLogic,
  FieldStyles,
  FieldValidations,
  FormStep,
  FormType,
  IntroModalState,
  SavedComponent,
  SetupConfig,
  SidebarTab,
} from "./storeTypes";

export interface AddFieldExtra {
  title?: string;
  optionCount?: number;
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
  updateRowColumns: (rowId: string, columns: number) => void;
  addFieldToRow: (rowId: string, fieldType: FieldTypeDef, extra?: AddFieldExtra) => void;
  removeField: (fieldId: string) => void;
  selectField: (fieldId: string | null) => void;
  updateField: (
    fieldId: string,
    updates: Partial<Pick<CanvasField, "label" | "colSpan" | "title" | "alwaysDisabled">>,
  ) => void;
  setFieldEnableWhen: (fieldId: string, condition: EnableCondition | null) => void;
  updateFieldValidations: (fieldId: string, updates: Partial<FieldValidations>) => void;
  updateFieldStyles: (fieldId: string, updates: Partial<FieldStyles>) => void;
  updateFieldLogic: (fieldId: string, updates: Partial<Pick<FieldLogic, "typeScript">>) => void;
  updateFieldFileConfig: (fieldId: string, updates: Partial<FieldFileConfig>) => void;
  toggleFieldDependency: (fieldId: string, dependsOnFieldId: string) => void;
  addFieldOption: (fieldId: string) => void;
  removeFieldOption: (fieldId: string, optionId: string) => void;
  updateFieldOptionLabel: (fieldId: string, optionId: string, label: string) => void;
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
