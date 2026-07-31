import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { operatorNeedsValue, operatorsForFieldType } from "../../lib/fieldCondition/fieldCondition";
import { buildFieldGraph, describeCycle, wouldCreateCycle } from "../../lib/fieldGraph/fieldGraph";
import { useFormStore } from "../../store/formStore";
import type { CanvasField, ConditionOperator, FieldRule, RuleCondition } from "../../types/field";
import type { FieldGraph } from "../../types/fieldGraph";
import type { UseFieldRulesParams, UseFieldRulesResult } from "./useFieldRules.types";

function conditionOn(target: CanvasField, id: string): RuleCondition {
  const operators: ConditionOperator[] = operatorsForFieldType(target.type);

  return {
    id,
    fieldId: target.id,
    operator: operators[0],
    value: operatorNeedsValue(operators[0]) ? "" : undefined,
  };
}

export function useFieldRules({ field, candidates }: UseFieldRulesParams): UseFieldRulesResult {
  const setFieldFormula = useFormStore((state) => state.setFieldFormula);
  const addFieldRule = useFormStore((state) => state.addFieldRule);
  const updateFieldRule = useFormStore((state) => state.updateFieldRule);
  const removeFieldRule = useFormStore((state) => state.removeFieldRule);
  const reorderFieldRule = useFormStore((state) => state.reorderFieldRule);

  const rules: FieldRule[] = field.logic.rules ?? [];
  const graph: FieldGraph = useMemo(
    () => buildFieldGraph([field, ...candidates]),
    [field, candidates],
  );

  function ruleById(ruleId: string): FieldRule | undefined {
    return rules.find((rule) => rule.id === ruleId);
  }

  function writeConditions(ruleId: string, when: RuleCondition[]): void {
    updateFieldRule(field.id, ruleId, { when });
  }

  function isSafeTarget(targetFieldId: string): boolean {
    return !wouldCreateCycle(graph, field.id, targetFieldId);
  }

  function rejectsCycle(targetFieldId: string): boolean {
    if (isSafeTarget(targetFieldId)) return false;

    window.alert(
      `Esa condición generaría un ciclo entre campos (${describeCycle(graph, [field.id, targetFieldId])}).`,
    );

    return true;
  }

  return {
    rules,
    formula: field.logic.formula ?? "",
    canAddRule: candidates.length > 0,
    setFormula: (formula) => setFieldFormula(field.id, formula),
    addRule: () => addFieldRule(field.id),
    removeRule: (ruleId) => removeFieldRule(field.id, ruleId),
    moveRule: (ruleId, offset) => reorderFieldRule(field.id, ruleId, offset),
    setRuleLabel: (ruleId, label) =>
      updateFieldRule(field.id, ruleId, { label: label.trim().length > 0 ? label : undefined }),
    setRuleMatchAll: (ruleId, matchAll) => updateFieldRule(field.id, ruleId, { matchAll }),
    addCondition: (ruleId) => {
      const rule = ruleById(ruleId);
      const target = candidates.find((candidate) => isSafeTarget(candidate.id));
      if (!rule || !target) return;
      writeConditions(ruleId, [...rule.when, conditionOn(target, uuidv4())]);
    },
    updateCondition: (ruleId, conditionId, updates) => {
      const rule = ruleById(ruleId);
      if (!rule) return;
      writeConditions(
        ruleId,
        rule.when.map((condition) =>
          condition.id === conditionId ? { ...condition, ...updates } : condition,
        ),
      );
    },
    setConditionField: (ruleId, conditionId, fieldId) => {
      const rule = ruleById(ruleId);
      const target = candidates.find((candidate) => candidate.id === fieldId);
      if (!rule || !target || rejectsCycle(fieldId)) return;
      writeConditions(
        ruleId,
        rule.when.map((condition) =>
          condition.id === conditionId ? conditionOn(target, condition.id) : condition,
        ),
      );
    },
    removeCondition: (ruleId, conditionId) => {
      const rule = ruleById(ruleId);
      if (!rule) return;
      writeConditions(
        ruleId,
        rule.when.filter((condition) => condition.id !== conditionId),
      );
    },
    addEffect: (ruleId, effect) => {
      const rule = ruleById(ruleId);
      if (!rule) return;
      updateFieldRule(field.id, ruleId, { effects: [...rule.effects, effect] });
    },
    updateEffect: (ruleId, effectId, effect) => {
      const rule = ruleById(ruleId);
      if (!rule) return;
      updateFieldRule(field.id, ruleId, {
        effects: rule.effects.map((current) => (current.id === effectId ? effect : current)),
      });
    },
    removeEffect: (ruleId, effectId) => {
      const rule = ruleById(ruleId);
      if (!rule) return;
      updateFieldRule(field.id, ruleId, {
        effects: rule.effects.filter((current) => current.id !== effectId),
      });
    },
  };
}
