import type { ExportedField, ExportedRule } from "../../types/exportForm";
import type { RuntimeIssue, RuntimeModel, RuntimeValues } from "../../types/formRuntime";
import type { ScriptRunResult } from "../../types/scriptRuntime";
import { evaluateFormula } from "../formula/formula";
import { evaluateConditions } from "../runtimeCondition/runtimeCondition";
import { coerceForScript, coerceValues, runFieldScript } from "../scriptRuntime/scriptRuntime";
import type { DerivedPlan } from "./runtimeFormula.types";
import { planDerivedFields } from "./runtimeFormula.utils";

export interface DerivedResult {
  values: RuntimeValues;
  computed: Record<string, boolean>;
  cycle: string[] | null;
  issues: RuntimeIssue[];
}

// Resuelve los campos calculados de un ambito en orden topologico, para que cuando le toque a uno
// sus dependencias ya esten resueltas.

// Primero el script -- o la formula, mientras queden campos sin migrar -- y despues cada regla que
// aplique pisa el valor, en el orden de la lista. `computed` marca lo que se calculo, que es lo que
// el simulador pinta como solo lectura.
export function computeDerivedValues(
  fields: ExportedField[],
  base: RuntimeValues,
  model: RuntimeModel,
  index = 0,
): DerivedResult {
  const plan: DerivedPlan = planDerivedFields(fields);
  const byName: Map<string, ExportedField> = new Map(fields.map((field) => [field.name, field]));
  const values: RuntimeValues = { ...base };
  // La vista coaccionada se mantiene en paralelo y se actualiza junto con `values`: un campo
  // calculado es dependencia del siguiente, y tiene que llegarle ya con su tipo.
  const scriptValues: RuntimeValues = coerceValues(values, model);
  const computed: Record<string, boolean> = {};
  const issues: RuntimeIssue[] = [];

  for (const name of plan.order) {
    const field: ExportedField | undefined = byName.get(name);
    if (!field) continue;

    // Si no hay script, formula ni regla que aplique, se conserva lo que el usuario escribio. Por
    // eso un campo calculado solo a veces necesita una base que lo devuelva a su valor neutro.
    let next: unknown = values[name];
    let touched = false;

    const script = field.logic.script;
    const ast = plan.asts.get(name) ?? null;

    if (script) {
      const run: ScriptRunResult = runFieldScript(
        script.compiled,
        model.prelude,
        scriptValues,
        scriptValues[name],
        index,
      );

      if (run.error) {
        issues.push({ kind: "script", field: name, message: run.error });
      } else if (run.value !== undefined) {
        // undefined es "no toques lo que escribio el usuario", asi que ni se asigna ni cuenta
        // como calculado: el campo sigue siendo suyo.
        next = run.value;
        touched = true;
      }
    } else if (ast) {
      next = evaluateFormula(ast, values);
      touched = true;
    }

    for (const rule of field.logic.rules ?? []) {
      if (!ruleMatches(rule, values)) continue;

      for (const effect of rule.effects) {
        if (effect.kind === "constant") {
          next = effect.value;
          touched = true;
          continue;
        }

        // Un efecto corre por el mismo camino que el script del campo, incluido el undefined:
        // una regla que se cumple pero no devuelve nada deja el valor como estaba.
        const run: ScriptRunResult = runFieldScript(
          effect.script.compiled,
          model.prelude,
          scriptValues,
          scriptValues[name],
          index,
        );

        if (run.error) {
          issues.push({ kind: "script", field: name, message: run.error });
          continue;
        }

        if (run.value === undefined) continue;

        next = run.value;
        touched = true;
      }
    }

    values[name] = next;
    scriptValues[name] = coerceForScript(next, field.type);
    if (touched) computed[name] = true;
  }

  return { values, computed, cycle: plan.cycle, issues };
}

function ruleMatches(rule: ExportedRule, values: RuntimeValues): boolean {
  return evaluateConditions(rule.when, values, rule.matchAll);
}
