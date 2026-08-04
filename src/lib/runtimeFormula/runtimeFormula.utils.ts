import type { ExportedField } from "../../types/exportForm";
import type { FormulaNode } from "../../types/formula";
import { collectFormulaRefs, parseFormula } from "../formula/formula";
import type { DerivedPlan } from "./runtimeFormula.types";

// Planificacion del orden de calculo. Trabaja sobre nombres, no ids: en el export los ids ya se
// resolvieron. Es el gemelo de fieldGraph, que hace lo mismo del lado del builder sobre el modelo.

export function isDerivedField(field: ExportedField): boolean {
  const hasFormula: boolean = Boolean(field.logic.formula && field.logic.formula.trim() !== "");
  const hasRules: boolean = Boolean(field.logic.rules && field.logic.rules.length > 0);

  return hasFormula || hasRules;
}

// Un campo depende tanto de lo que leen sus formulas como de lo que miran las condiciones de sus
// reglas: si la condicion observa un campo calculado, ese tiene que resolverse antes.
export function fieldRefs(field: ExportedField, asts: Map<string, FormulaNode | null>): string[] {
  const refs: string[] = [...collectFormulaRefs(asts.get(field.name) ?? null)];

  for (const rule of field.logic.rules ?? []) {
    for (const condition of rule.when) refs.push(condition.field);

    for (const effect of rule.effects) {
      if (effect.kind === "formula") {
        refs.push(...collectFormulaRefs(parseFormula(effect.expression).ast));
      }
    }
  }

  return refs;
}

export function planDerivedFields(fields: ExportedField[]): DerivedPlan {
  const derived: ExportedField[] = fields.filter(isDerivedField);
  const asts: Map<string, FormulaNode | null> = new Map();

  for (const field of derived) {
    asts.set(field.name, field.logic.formula ? parseFormula(field.logic.formula).ast : null);
  }

  const names: Set<string> = new Set(derived.map((field) => field.name));
  const dependsOn: Map<string, Set<string>> = new Map();
  const dependents: Map<string, string[]> = new Map();

  for (const field of derived) {
    // Solo cuentan las dependencias hacia otros campos derivados: los que el usuario escribe ya
    // tienen valor cuando empieza el calculo. Un autorreferencia se ignora para no trabar el plan.
    const own: Set<string> = new Set(
      fieldRefs(field, asts).filter((ref) => names.has(ref) && ref !== field.name),
    );
    dependsOn.set(field.name, own);

    for (const ref of own) {
      dependents.set(ref, [...(dependents.get(ref) ?? []), field.name]);
    }
  }

  const pending: string[] = derived
    .map((field) => field.name)
    .filter((name) => (dependsOn.get(name)?.size ?? 0) === 0);
  const order: string[] = [];
  const remaining: Map<string, number> = new Map(
    derived.map((field) => [field.name, dependsOn.get(field.name)?.size ?? 0]),
  );

  while (pending.length > 0) {
    const name: string = pending.shift() as string;
    order.push(name);

    for (const dependent of dependents.get(name) ?? []) {
      const next: number = (remaining.get(dependent) ?? 0) - 1;
      remaining.set(dependent, next);
      if (next === 0) pending.push(dependent);
    }
  }

  // Kahn: lo que nunca llego a cero dependencias pendientes esta en un ciclo. Queda fuera del
  // orden en lugar de colarse al final, para que el simulador pueda avisar en vez de dar 0.
  const cycle: string[] = derived
    .map((field) => field.name)
    .filter((name) => !order.includes(name));

  return { order, cycle: cycle.length > 0 ? cycle : null, asts };
}
