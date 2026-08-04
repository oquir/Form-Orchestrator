import type { ExportedField, ExportedRule } from "../../types/exportForm";
import type { RuntimeValues } from "../../types/formRuntime";
import { evaluateFormula, parseFormula } from "../formula/formula";
import { evaluateConditions } from "../runtimeCondition/runtimeCondition";
import type { DerivedPlan } from "./runtimeFormula.types";
import { planDerivedFields } from "./runtimeFormula.utils";

export interface DerivedResult {
  values: RuntimeValues;
  computed: Record<string, boolean>;
  cycle: string[] | null;
}

// Resuelve los campos calculados de un ambito en orden topologico, para que cuando le toque a uno
// sus dependencias ya esten resueltas.

// La formula base corre primero y despues cada regla que aplique pisa el valor, en el orden de la
// lista. `computed` marca lo que se calculo, que es lo que el simulador pinta como solo lectura.
export function computeDerivedValues(fields: ExportedField[], base: RuntimeValues): DerivedResult {
  const plan: DerivedPlan = planDerivedFields(fields);
  const byName: Map<string, ExportedField> = new Map(fields.map((field) => [field.name, field]));
  const values: RuntimeValues = { ...base };
  const computed: Record<string, boolean> = {};

  for (const name of plan.order) {
    const field: ExportedField | undefined = byName.get(name);
    if (!field) continue;

    // Si no hay formula ni regla que aplique, se conserva lo que el usuario escribio. Por eso un
    // campo calculado solo a veces necesita una formula base que lo devuelva a su valor neutro.
    let next: unknown = values[name];
    let touched = false;

    const ast = plan.asts.get(name) ?? null;
    if (ast) {
      next = evaluateFormula(ast, values);
      touched = true;
    }

    for (const rule of field.logic.rules ?? []) {
      if (!ruleMatches(rule, values)) continue;

      for (const effect of rule.effects) {
        next =
          effect.kind === "constant"
            ? effect.value
            : evaluateFormula(parseFormula(effect.expression).ast, values);
        touched = true;
      }
    }

    values[name] = next;
    if (touched) computed[name] = true;
  }

  return { values, computed, cycle: plan.cycle };
}

function ruleMatches(rule: ExportedRule, values: RuntimeValues): boolean {
  return evaluateConditions(rule.when, values, rule.matchAll);
}
