import { SCRIPT_HELPER_NAMES } from "../../constants/fieldScript";
import type {
  ExportedCondition,
  ExportedField,
  ExportedFormSchema,
  ExportedGroupCheck,
  ExportedLogic,
  ExportedRepeatableGroup,
  ExportedRow,
  ExportedRule,
  ExportedSetupConfig,
  ExportedStep,
  ExportedTooltip,
  ExportedValidations,
} from "../../types/exportForm";
import type { FieldDataSource } from "../../types/field";
import type { RichTextLeaf } from "../../types/richText";
import type { KeyTable } from "./formRequires.types";

// Una tabla por cada objeto del export que tiene claves opcionales o donde suelen aparecer las
// nuevas. Cada una cubre todas las claves de su tipo -- el compilador lo exige --, asi que agregar
// una clave al export obliga a decidir aca si es esqueleto o capacidad. Si ademas su valor sale de
// una lista cerrada sobre la que el consumidor decide (un tipo, un operador, un formato), hay que
// declararlo tambien por valor en formRequires.utils: ese paso el compilador no lo puede exigir.
//
// Sin tabla quedan los objetos que son esqueleto puro: el script compilado, la variante de una
// validacion, el relleno de catalogo, la opcion, la configuracion de archivo y el parrafo de texto
// enriquecido. El dia que alguno gane una clave opcional, necesita la suya.

export const SETUP_CONFIG_KEYS: KeyTable<ExportedSetupConfig> = {
  hasIntroModal: "core",
  introModal: "feature",
};

export const FORM_SCHEMA_KEYS: KeyTable<ExportedFormSchema> = {
  gridBaseColumns: "core",
  prelude: "feature",
  steps: "core",
};

export const STEP_KEYS: KeyTable<ExportedStep> = {
  stepId: "core",
  title: "core",
  subtitle: "feature",
  hidden: "feature",
  rows: "core",
  groups: "feature",
};

export const ROW_KEYS: KeyTable<ExportedRow> = {
  rowId: "core",
  columns: "core",
  // Pertenecer a un grupo ya lo declara step.groups.
  groupId: "core",
  styles: "feature",
  fields: "core",
};

export const FIELD_KEYS: KeyTable<ExportedField> = {
  fieldId: "core",
  name: "core",
  // Se declara por valor: type:date.
  type: "core",
  label: "core",
  colStart: "core",
  colSpan: "core",
  // Siempre viaja, aunque sea {}: cuenta solo cuando trae CSS.
  styles: "feature",
  // Se recorren por dentro, con sus propias tablas.
  validations: "core",
  logic: "core",
  // Son parte de su tipo de campo y las cubre la palabra del tipo: checkbox, file, rich_text y los
  // de opciones.
  title: "core",
  options: "core",
  fileConfig: "core",
  content: "core",
  // Se declara por valor: binding:mapped.
  apiBinding: "core",
  alwaysDisabled: "feature",
  enableWhen: "feature",
  visibleWhen: "feature",
  dataSource: "feature",
  labelFor: "feature",
  tooltip: "feature",
  rounding: "feature",
  formatted: "feature",
  allowsNegative: "present",
  decimals: "feature",
  prefix: "feature",
  suffix: "feature",
  placeholder: "feature",
  inlineOptions: "feature",
  dateRange: "feature",
  includesTime: "feature",
  dateFormat: "feature",
  maxLength: "feature",
};

export const VALIDATION_KEYS: KeyTable<ExportedValidations> = {
  // Hidratar el schema de Zod es lo minimo que hace cualquier consumidor.
  zodSchema: "core",
  zodSchemaWhen: "feature",
};

export const LOGIC_KEYS: KeyTable<ExportedLogic> = {
  script: "feature",
  rules: "feature",
};

export const CONDITION_KEYS: KeyTable<ExportedCondition> = {
  field: "core",
  // Se declara por valor: operator:equals.
  operator: "core",
  value: "core",
};

export const RULE_KEYS: KeyTable<ExportedRule> = {
  id: "core",
  label: "core",
  matchAll: "core",
  when: "core",
  effects: "core",
};

export const DATA_SOURCE_KEYS: KeyTable<FieldDataSource> = {
  // Se declara por valor: catalog:ciudades.
  catalog: "core",
  dependsOn: "feature",
  fills: "feature",
};

export const TOOLTIP_KEYS: KeyTable<ExportedTooltip> = {
  content: "core",
  // Se declara por valor: tooltipPosition:top.
  position: "core",
  styles: "feature",
};

export const RICH_TEXT_LEAF_KEYS: KeyTable<RichTextLeaf> = {
  text: "core",
  bold: "feature",
  italic: "feature",
  underline: "feature",
  href: "feature",
};

export const GROUP_KEYS: KeyTable<ExportedRepeatableGroup> = {
  groupId: "core",
  name: "core",
  title: "core",
  min: "core",
  max: "core",
  // Sin ruta el grupo no viaja en el payload, pero eso no le pide nada nuevo al consumidor.
  arrayPath: "core",
  zodSchema: "core",
  checks: "feature",
};

export const GROUP_CHECK_KEYS: KeyTable<ExportedGroupCheck> = {
  id: "core",
  label: "core",
  script: "core",
  message: "core",
};

// Un helper cuenta donde aparece como identificador suelto: no despues de un punto (Math.max no
// es el helper max) ni pegado a una comilla (__v["max"] es un campo que se llama asi).
export const HELPER_PATTERNS: [string, RegExp][] = SCRIPT_HELPER_NAMES.map((name) => [
  name,
  new RegExp(`(?<![\\w$."'])${name}(?![\\w$])`),
]);
