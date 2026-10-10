import type { ExportedCondition, ExportedField, ExportedStep } from "../../types/exportForm";
import type { RichTextContent } from "../../types/richText";
import {
  CONDITION_KEYS,
  DATA_SOURCE_KEYS,
  FIELD_KEYS,
  GROUP_CHECK_KEYS,
  GROUP_KEYS,
  HELPER_PATTERNS,
  LOGIC_KEYS,
  RICH_TEXT_LEAF_KEYS,
  ROW_KEYS,
  RULE_KEYS,
  STEP_KEYS,
  TOOLTIP_KEYS,
  VALIDATION_KEYS,
} from "./formRequires.constants";
import type { KeyRule, KeyTable } from "./formRequires.types";

// Si el valor trae algo que un consumidor tendria que interpretar. false no cuenta: los booleanos
// del export viajan como true o no viajan, salvo alwaysDisabled, que queda en false al apagarlo
// desde el panel. Un objeto cuenta si alguna clave tiene valor: en memoria, antes de serializar,
// las ausentes siguen ahi como undefined.
function carriesValue(value: unknown): boolean {
  if (value === undefined || value === null || value === false || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.values(value).some((item) => item !== undefined);

  return true;
}

export function declareKeys<T extends object>(
  words: Set<string>,
  scope: string,
  object: T,
  table: KeyTable<T>,
): void {
  for (const [key, rule] of Object.entries(table) as [keyof T & string, KeyRule][]) {
    const value: unknown = object[key];
    const declared: boolean =
      rule === "present" ? value !== undefined : rule === "feature" && carriesValue(value);

    if (declared) words.add(`${scope}.${key}`);
  }
}

// Busca sobre el texto entero, comentarios y strings incluidos, y es a proposito: un falso
// positivo solo pide de mas, mientras que separar codigo de texto aca -- con un recorrido distinto
// del de fieldScript -- podria esconder una llamada real, que es justo el fallo silencioso que esta
// lista existe para evitar.
export function declareHelpers(words: Set<string>, code: string): void {
  for (const [name, pattern] of HELPER_PATTERNS) {
    if (pattern.test(code)) words.add(`helper:${name}`);
  }
}

function declareRichText(words: Set<string>, content: RichTextContent): void {
  for (const paragraph of content) {
    words.add(`richTextBlock:${paragraph.type}`);

    for (const leaf of paragraph.children) {
      declareKeys(words, "richText", leaf, RICH_TEXT_LEAF_KEYS);
    }
  }
}

function declareField(words: Set<string>, field: ExportedField): void {
  words.add(`type:${field.type}`);
  declareKeys(words, "field", field, FIELD_KEYS);
  declareKeys(words, "field.validations", field.validations, VALIDATION_KEYS);
  declareKeys(words, "field.logic", field.logic, LOGIC_KEYS);

  if (field.apiBinding) words.add(`binding:${field.apiBinding.kind}`);
  if (field.dateFormat) words.add(`dateFormat:${field.dateFormat}`);
  if (field.logic.script) declareHelpers(words, field.logic.script.compiled);

  const conditions: ExportedCondition[] = [
    ...(field.enableWhen ? [field.enableWhen] : []),
    ...(field.visibleWhen ? [field.visibleWhen] : []),
    ...(field.validations.zodSchemaWhen ?? []).map((variant) => variant.when),
    ...(field.logic.rules ?? []).flatMap((rule) => rule.when),
  ];

  for (const condition of conditions) {
    words.add(`operator:${condition.operator}`);
    declareKeys(words, "condition", condition, CONDITION_KEYS);
  }

  for (const rule of field.logic.rules ?? []) {
    declareKeys(words, "rule", rule, RULE_KEYS);

    for (const effect of rule.effects) {
      words.add(`effect:${effect.kind}`);
      if (effect.kind === "script") declareHelpers(words, effect.script.compiled);
    }
  }

  if (field.dataSource) {
    words.add(`catalog:${field.dataSource.catalog}`);
    declareKeys(words, "field.dataSource", field.dataSource, DATA_SOURCE_KEYS);

    for (const fill of field.dataSource.fills ?? []) {
      words.add(`fillColumn:${fill.column}`);
    }
  }

  if (field.content) declareRichText(words, field.content);

  if (field.tooltip) {
    words.add(`tooltipPosition:${field.tooltip.position}`);
    declareKeys(words, "field.tooltip", field.tooltip, TOOLTIP_KEYS);
    declareRichText(words, field.tooltip.content);
  }
}

export function declareStep(words: Set<string>, step: ExportedStep): void {
  declareKeys(words, "step", step, STEP_KEYS);

  for (const row of step.rows) {
    declareKeys(words, "row", row, ROW_KEYS);

    for (const field of row.fields) {
      declareField(words, field);
    }
  }

  for (const group of step.groups ?? []) {
    declareKeys(words, "group", group, GROUP_KEYS);

    for (const check of group.checks ?? []) {
      declareKeys(words, "groupCheck", check, GROUP_CHECK_KEYS);
      declareHelpers(words, check.script.compiled);
    }
  }
}
