import { v4 as uuidv4 } from "uuid";
import type { FieldRule, RuleEffect } from "../../types/field";

// Manipulacion de las reglas de un campo. El orden de la lista es semantico: al evaluar, la
// formula base corre primero y despues cada regla que aplique pisa el valor, en este orden.
// Condiciones y efectos llevan id propio para poder listarlos y reordenarlos sin usar el indice.

export function createFieldRule(): FieldRule {
  return { id: uuidv4(), matchAll: true, when: [], effects: [] };
}

export function createFormulaEffect(): RuleEffect {
  return { id: uuidv4(), kind: "formula", expression: "" };
}

export function createConstantEffect(): RuleEffect {
  return { id: uuidv4(), kind: "constant", value: "" };
}

export function moveRule(rules: FieldRule[], ruleId: string, offset: number): FieldRule[] {
  const index: number = rules.findIndex((rule) => rule.id === ruleId);

  if (index === -1) return rules;

  const target: number = index + offset;

  if (target < 0 || target >= rules.length) return rules;

  const next: FieldRule[] = [...rules];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);

  return next;
}

// Limpia las referencias a un campo que se acaba de borrar. Una regla que se queda sin ninguna
// condicion se descarta entera: sin condiciones aplicaria siempre, que es lo contrario de lo
// que el usuario habia escrito.
export function pruneRulesReferencing(
  rules: FieldRule[] | undefined,
  fieldId: string,
): FieldRule[] | undefined {
  if (!rules) return undefined;

  const next: FieldRule[] = [];

  for (const rule of rules) {
    const when = rule.when.filter((condition) => condition.fieldId !== fieldId);

    if (when.length === rule.when.length) {
      next.push(rule);
      continue;
    }

    if (when.length === 0) continue;

    next.push({ ...rule, when });
  }

  return next;
}

export function collectRuleRefs(rules: FieldRule[] | undefined): string[] {
  const refs: string[] = [];
  const seen = new Set<string>();

  for (const rule of rules ?? []) {
    for (const condition of rule.when) {
      if (seen.has(condition.fieldId)) continue;
      seen.add(condition.fieldId);
      refs.push(condition.fieldId);
    }
  }

  return refs;
}

export function ruleFormulaExpressions(rules: FieldRule[] | undefined): string[] {
  const expressions: string[] = [];

  for (const rule of rules ?? []) {
    for (const effect of rule.effects) {
      if (effect.kind === "formula") expressions.push(effect.expression);
    }
  }

  return expressions;
}
