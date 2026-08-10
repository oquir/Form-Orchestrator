import type {
  ApiBinding,
  ConditionOperator,
  FieldCondition,
  FieldDataSource,
  FieldFileConfig,
  FieldOption,
  FieldStyles,
  FieldTooltip,
  RuleEffect,
} from "./field";
import type { RichTextContent } from "./richText";
import type { FormType } from "./setup";

export interface ExportedCondition {
  field: string;
  operator: ConditionOperator;
  value?: FieldCondition["value"] | string[];
}

export interface ExportedRule {
  id: string;
  label?: string;
  matchAll: boolean;
  when: ExportedCondition[];
  effects: RuleEffect[];
}

export interface ExportedValidationVariant {
  when: ExportedCondition;
  zodSchema: string;
}

// El consumidor recorre `zodSchemaWhen` en orden y se queda con el primero cuya condicion se
// cumpla; si ninguna se cumple, valida con `zodSchema`. La ausencia de `zodSchema` sigue siendo
// como sabe que un campo presentacional no valida nada.
export interface ExportedValidations {
  zodSchema?: string;
  zodSchemaWhen?: ExportedValidationVariant[];
}

// `compiled` es cuerpo de funcion listo para new Function, precedido del preludio del formulario
// si lo hay. `source` viaja solo para poder reeditarlo: ejecutarlo seria un error, porque {campo}
// no es JS. `reads` son los nombres que lee, para poder ordenar el calculo sin volver a parsear.
export interface ExportedScript {
  source: string;
  compiled: string;
  reads: string[];
}

export interface ExportedLogic {
  script?: ExportedScript;
  dependencies: string[];
  typeScript: string;
  formula?: string;
  rules?: ExportedRule[];
}

export interface ExportedField {
  fieldId: string;
  name: string;
  type: string;
  label: string;
  colStart: number;
  colSpan: number;
  styles: FieldStyles;
  validations: ExportedValidations;
  logic: ExportedLogic;
  title?: string;
  options?: FieldOption[];
  fileConfig?: FieldFileConfig;
  alwaysDisabled?: boolean;
  enableWhen?: ExportedCondition;
  visibleWhen?: ExportedCondition;
  apiBinding?: ApiBinding;
  dataSource?: FieldDataSource;
  labelFor?: string;
  content?: RichTextContent;
  tooltip?: FieldTooltip;
}

export interface ExportedRepeatableGroup {
  groupId: string;
  name: string;
  title: string;
  min: number;
  max: number;
  arrayPath?: string;
  zodSchema: string;
}

export interface ExportedRow {
  rowId: string;
  columns: number;
  groupId?: string;
  fields: ExportedField[];
}

export interface ExportedStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: ExportedRow[];
  groups?: ExportedRepeatableGroup[];
}

export interface ProjectMeta {
  formId: string;
  formType: FormType | null;
  version: string;
  createdAt: string;
}

export interface ExportedIntroModal {
  steps: ExportedStep[];
}

export interface ExportedSetupConfig {
  hasIntroModal: boolean;
  introModal?: ExportedIntroModal;
}

export interface ExportedFormSchema {
  gridBaseColumns: number;
  // Funciones y constantes compartidas por todos los scripts. Va una sola vez y no repetido
  // dentro de cada `compiled`: quien ejecute lo antepone al cuerpo del campo.
  prelude?: string;
  steps: ExportedStep[];
}

export interface FormExport {
  projectMeta: ProjectMeta;
  setupConfig: ExportedSetupConfig;
  formSchema: ExportedFormSchema;
}
