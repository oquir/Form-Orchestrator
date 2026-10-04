import { OPERATOR_LABELS } from "../../../../constants/conditions";
import {
  operatorIsStringBased,
  operatorNeedsValue,
  operatorTakesList,
  parseConditionList,
} from "../../../../lib/fieldCondition/fieldCondition";
import type {
  CanvasField,
  FieldOption,
  FieldRule,
  RuleCondition,
  RuleEffect,
} from "../../../../types/field";
import { EMPTY_VALUE_TEXT } from "./FieldRulesEditor.constants";
import type { RuleEffectSummary, RuleSummary } from "./FieldRulesEditor.types";

// El valor se nombra como lo muestra ConditionValueInput: la etiqueta de la opcion donde el campo
// tiene opciones propias, el texto tal cual donde el operador compara texto.
function describeValue(condition: RuleCondition, observed: CanvasField | undefined): string {
  const options: FieldOption[] = observed?.options ?? [];
  const optionLabel = (id: string): string =>
    options.find((option) => option.id === id)?.label ?? id;

  if (operatorTakesList(condition.operator)) {
    const entries: string[] = parseConditionList(condition.value);

    return entries.length === 0
      ? EMPTY_VALUE_TEXT
      : entries.map((entry) => `«${optionLabel(entry)}»`).join(", ");
  }

  const text: string = condition.value === undefined ? "" : String(condition.value);
  if (text === "") return EMPTY_VALUE_TEXT;

  return `«${operatorIsStringBased(condition.operator) ? text : optionLabel(text)}»`;
}

function describeCondition(condition: RuleCondition, candidates: CanvasField[]): string {
  const observed: CanvasField | undefined = candidates.find(
    (candidate) => candidate.id === condition.fieldId,
  );
  const subject: string = observed ? observed.label || observed.name : "(campo eliminado)";
  const phrase: string = `${subject} ${OPERATOR_LABELS[condition.operator]}`;

  return operatorNeedsValue(condition.operator)
    ? `${phrase} ${describeValue(condition, observed)}`
    : phrase;
}

function describeEffect(effect: RuleEffect): RuleEffectSummary {
  if (effect.kind === "constant") {
    const text: string = String(effect.value);

    return {
      id: effect.id,
      text: text === "" ? "Deja el campo vacío" : `Valor fijo «${text}»`,
      isCode: false,
    };
  }

  const source: string = effect.source.replace(/\s+/g, " ").trim();

  return source === ""
    ? { id: effect.id, text: "Cálculo vacío", isCode: false }
    : { id: effect.id, text: source, isCode: true };
}

export function summarizeRule(rule: FieldRule, candidates: CanvasField[]): RuleSummary {
  const label: string = rule.label?.trim() ?? "";
  const conditions: string[] = rule.when.map((condition) =>
    describeCondition(condition, candidates),
  );

  return {
    id: rule.id,
    label: label === "" ? null : label,
    when:
      conditions.length === 0
        ? "Aplica siempre"
        : `Si ${conditions.join(rule.matchAll ? " y " : " o ")}`,
    effects: rule.effects.map(describeEffect),
  };
}
