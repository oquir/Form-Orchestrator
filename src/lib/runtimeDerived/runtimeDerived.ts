import type { ExportedField, ExportedRule } from "../../types/exportForm";
import type { RuntimeIssue, RuntimeModel, RuntimeValues } from "../../types/formRuntime";
import type { ScriptRunResult } from "../../types/scriptRuntime";
import { applyRounding } from "../fieldRounding/fieldRounding";
import { clampNegative } from "../fieldSign/fieldSign";
import { evaluateConditions } from "../runtimeCondition/runtimeCondition";
import { coerceForScript, coerceValues, runFieldScript } from "../scriptRuntime/scriptRuntime";
import type { DerivedPlan } from "./runtimeDerived.types";
import { planDerivedFields } from "./runtimeDerived.utils";

export interface DerivedResult {
  values: RuntimeValues;
  computed: Record<string, boolean>;
  clamped: Record<string, boolean>;
  cycle: string[] | null;
  issues: RuntimeIssue[];
}

// Resuelve los campos calculados de un ambito en orden topologico, para que cuando le toque a uno
// sus dependencias ya esten resueltas.

// Primero el script del campo y despues cada regla que aplique, pisando el valor en el orden de la
// lista. `computed` marca lo que se calculo, que es lo que el simulador pinta como solo lectura.
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
  const clamped: Record<string, boolean> = {};
  const issues: RuntimeIssue[] = [];

  // undefined es "no toques lo que escribio el usuario": ni se asigna ni cuenta como calculado,
  // asi que el campo sigue siendo suyo. Vale igual para el script del campo y para un efecto.
  function apply(run: ScriptRunResult, name: string, current: unknown): [unknown, boolean] {
    if (run.error) {
      issues.push({ kind: "script", field: name, message: run.error });
      return [current, false];
    }

    return run.value === undefined ? [current, false] : [run.value, true];
  }

  for (const name of plan.order) {
    const field: ExportedField | undefined = byName.get(name);
    if (!field) continue;

    // Si no hay script ni regla que aplique, se conserva lo que el usuario escribio. Por eso un
    // campo calculado solo a veces necesita una base que lo devuelva a su valor neutro.
    let next: unknown = values[name];
    let touched = false;

    if (field.logic.script) {
      const [value, changed] = apply(
        runFieldScript(
          field.logic.script.compiled,
          model.prelude,
          scriptValues,
          scriptValues[name],
          index,
        ),
        name,
        next,
      );
      next = value;
      touched = touched || changed;
    }

    for (const rule of field.logic.rules ?? []) {
      if (!ruleMatches(rule, values)) continue;

      for (const effect of rule.effects) {
        if (effect.kind === "constant") {
          next = effect.value;
          touched = true;
          continue;
        }

        const [value, changed] = apply(
          runFieldScript(
            effect.script.compiled,
            model.prelude,
            scriptValues,
            scriptValues[name],
            index,
          ),
          name,
          next,
        );
        next = value;
        touched = touched || changed;
      }
    }

    // El redondeo va antes de publicar el valor, no despues: el campo de abajo lo lee de
    // scriptValues en la misma pasada, y aproximarlo mas tarde dejaria la cadena de renglones con
    // dos verdades -- una en pantalla y otra en el calculo siguiente.
    //
    // Solo si algo lo produjo. Un campo calculado cuyo script devolvio undefined sigue siendo del
    // usuario, y a lo que el usuario escribe lo redondea el blur del simulador.
    if (touched) {
      next = applyRounding(field, next);

      // El recorte va despues del redondeo y antes de publicar, igual que el: si se recortara
      // mas tarde el campo de abajo leeria el negativo que en pantalla ya no esta.
      const clamp = clampNegative(field, next);
      next = clamp.value;
      if (clamp.clamped) clamped[name] = true;
    }

    values[name] = next;
    scriptValues[name] = coerceForScript(next, field.type);
    if (touched) computed[name] = true;
  }

  return { values, computed, clamped, cycle: plan.cycle, issues };
}

function ruleMatches(rule: ExportedRule, values: RuntimeValues): boolean {
  return evaluateConditions(rule.when, values, rule.matchAll);
}
